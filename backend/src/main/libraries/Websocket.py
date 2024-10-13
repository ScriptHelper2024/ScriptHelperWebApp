import redis
import json
import os
from dotenv import load_dotenv
from main.libraries.functions import log_message

class Websocket:
    def __init__(self):
        # Load environment variables
        load_dotenv()

        # Check if websockets should be mocked
        self.mock_websockets = os.getenv('MOCK_WEBSOCKETS') == '1'

        if not self.mock_websockets:
            # Initialize Redis client if not mocking
            self.redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST"),
                port=os.getenv("REDIS_PORT"),
                db=0
            )

    def broadcast_message(self, channel, message):
        """Broadcast a message to a WebSocket channel via Redis"""
        if self.mock_websockets:
            # Mocking is enabled, so skip the actual broadcast
            return True

        try:
            # Construct message in the expected format
            notification = {
                'channel': channel,
                'notification': message
            }
            # Convert to JSON string
            notification_json = json.dumps(notification)
            # Publish the message to the "notifications" Redis channel
            self.redis_client.publish('notifications', notification_json)
            return True
        except Exception as e:
            # Handle any exceptions that may occur
            log_message('error', f"Error broadcasting message: {e}")
            return False

    def listen_to_channel(self, channel):
        """Listen to messages on a WebSocket channel via Redis"""
        if self.mock_websockets:
            # Mocking is enabled, throw an exception
            raise Exception("Cannot listen to channel while websockets are mocked")

        pubsub = self.redis_client.pubsub()
        pubsub.subscribe(channel)
        log_message('debug', f"Subscribed to {channel}, listening for messages...")
        for message in pubsub.listen():
            if message['type'] == 'message':
                notification = json.loads(message['data'].decode('utf-8'))
                log_message('debug', f"Received notification: {notification}")
