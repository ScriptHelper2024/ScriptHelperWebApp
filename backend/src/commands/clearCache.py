from main.libraries.Cache import Cache
import redis
import os
from dotenv import load_dotenv

load_dotenv()

class ClearCache:
    command_name = 'clearCache'

    def run(self, args):
        if os.getenv('CACHE_DISABLED') == '1':
            print("Cache is disabled.")
            return

        try:
            redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST"),
                port=os.getenv("REDIS_PORT"),
                db=0
            )
            cache_prefix = f"{os.getenv('APP_ID', '')}cache_*"
            keys = redis_client.keys(cache_prefix)
            if not keys:
                print("No cache keys to clear.")
                return
            for key in keys:
                redis_client.delete(key)
            print(f"Cleared all cache entries with prefix {cache_prefix}.")
        except Exception as e:
            print(f"Error clearing cache: {e}")
