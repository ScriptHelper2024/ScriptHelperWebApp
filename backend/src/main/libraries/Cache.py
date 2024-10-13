import dill as pickle  # Using dill as a drop-in replacement for pickle
import redis
import os
import hashlib
from dotenv import load_dotenv
from main.libraries.functions import log_message

load_dotenv()

class Cache:
    def __init__(self):
        if os.getenv('CACHE_DISABLED') != '1':
            self.redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST"),
                port=os.getenv("REDIS_PORT"),
                db=0
            )
        self.cache_prefix = f"{os.getenv('APP_ID', '')}cache_"

    def hashed_key(self, key):
        """Hash the cache key using SHA256 and prepend prefix."""
        hash_object = hashlib.sha256(key.encode())
        return f"{self.cache_prefix}{hash_object.hexdigest()}"

    def set(self, key, value, timeout=None, tags=[]):
        """
        Serialize a value with dill and set it in the cache.
        Optionally, associate the cache entry with tags and set an expiration timeout.
        """
        if os.getenv('CACHE_DISABLED') == '1':
            return True #skip cache if disabled
        try:
            hash_key = self.hashed_key(key)
            # Serialize the value with dill
            value_serialized = pickle.dumps(value)
            if timeout:
                self.redis_client.setex(hash_key, timeout, value_serialized)
            else:
                self.redis_client.set(hash_key, value_serialized)

            if tags:
               self.redis_client.hset("key_tags", hash_key, ",".join(tags))
               for tag in tags:
                   self.redis_client.sadd(f"tag:{tag}", hash_key)

            return True
        except Exception as e:
            log_message('error', f"Error setting cache for {key}: {e}")
            return False


    def get(self, key, direct_key=False):
        """
        Get a value from the cache and deserialize it using dill.
        """
        if os.getenv('CACHE_DISABLED') == '1':
            return None #skip cache if disabled
        try:
            hash_key = key
            if not direct_key:
                hash_key = self.hashed_key(key)
            value_serialized = self.redis_client.get(hash_key)
            if value_serialized is None:
                return None
            # Deserialize the value with dill
            return pickle.loads(value_serialized)
        except Exception as e:
            log_message('error', f"Error getting cache for {key}: {e}")
            return None

    def forget(self, key, direct_key=False):
        """
        Remove a key from the cache and disassociate it from any tags.
        Includes cleanup step to delete tags with no keys associated.
        """
        if os.getenv('CACHE_DISABLED') == '1':
            return True #skip cache if disabled
        try:
            hash_key = key
            if not direct_key:
                hash_key = self.hashed_key(key)

            # Retrieve the tags associated with this key
            tags = self.redis_client.hget("key_tags", hash_key)
            if tags:
                tags = tags.decode('utf-8').split(",")
                for tag in tags:
                    self.redis_client.srem(f"tag:{tag}", hash_key)
                    # Check if the tag set is now empty and delete it if so
                    if self.redis_client.scard(f"tag:{tag}") == 0:
                        self.redis_client.delete(f"tag:{tag}")
                # Remove the key's tag associations from the hash
                self.redis_client.hdel("key_tags", hash_key)

            # Finally, delete the key itself
            self.redis_client.delete(hash_key)
            return True
        except Exception as e:
            log_message('error', f"Error deleting cache for {key}: {e}")
            return False

    def pull(self, key):
        """
        Retrieve and then remove a key from the cache.
        """
        try:
            value = self.get(key)
            self.forget(key)
            return value
        except Exception as e:
            log_message('error', f"Error pulling cache for {key}: {e}")
            return None

    def forget_by_tags(self, tags=[]):
        """
        Clear all cache entries associated with any of the specified tags.
        Enhanced logging for debugging.
        """
        if os.getenv('CACHE_DISABLED') == '1':
            return True #skip cache if disabled
        try:
            for tag in tags:
                keys_to_clear = self.redis_client.smembers(f"tag:{tag}")
                for key in keys_to_clear:
                    self.forget(key, direct_key=True)

                # Check if the tag has any remaining members before attempting to delete
                if self.redis_client.scard(f"tag:{tag}") == 0:
                    self.redis_client.delete(f"tag:{tag}")
            return True
        except Exception as e:
            log_message('error', f"Error clearing cache by tags {tags}: {e}")
            return False
