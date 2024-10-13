import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, join_room
import redis
import json
from main.libraries.functions import setup_opentelemetry

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

if os.getenv('OPENTELEMETRY_ENABLED') == 'True':
    setup_opentelemetry(app)

# Explicitly set async_mode to 'threading'

async_mode = 'threading'
if os.getenv("FLASK_ENV") == "production":
    async_mode = 'gevent'

socketio = SocketIO(app, cors_allowed_origins='*', async_mode=async_mode)

# Initialize Redis client
redis_client = redis.Redis(host=os.getenv("REDIS_HOST"), port=os.getenv("REDIS_PORT"), db=0)

# Simple log message function
def log_message(message):
    log_file_path = os.path.join(os.getenv('APP_PATH'), 'logs', 'websockets.log')
    time_stamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    with open(log_file_path, 'a') as log_file:
        log_file.write(f"{time_stamp} - {message}\n")

# Define the WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    log_message('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    log_message('Client disconnected')

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    log_message(f'Client joined room: {room}')

def message_received_handler(message):
    # Log received message for debugging
    log_message(f"Received message: {message}")

    # Decode the message data
    data = json.loads(message['data'].decode('utf-8'))

    # Log the decoded data
    log_message(f"Received data: {data}")

    # Emit to the channel specified in the message
    # Assuming the message data contains 'channel' and 'notification' keys
    socketio.emit('message', data['notification'], room=data['channel'])

pubsub = redis_client.pubsub(ignore_subscribe_messages=True)
pubsub.subscribe(**{'notifications': message_received_handler})

# Start a thread that listens for incoming messages on the Redis channel
def redis_listener():
   for message in pubsub.listen():
       # Check that the received message is of type 'message'
       if message['type'] == 'message':
           message_received_handler(message)
       socketio.sleep(0.1)  # Non-blocking sleep

# Start the Redis listener in a background thread
socketio.start_background_task(redis_listener)

if __name__ == '__main__':
    if os.getenv("FLASK_ENV") == "production":
        # Don't call app.run() directly in production
        pass

    # Ensure the logs directory exists
    logs_dir = os.path.join(os.getenv('APP_PATH'), 'logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)

    # Run the WebSocket server
    socketio.run(app, debug=False, host='0.0.0.0', port=int(os.getenv("WEBSOCKET_SERVER_PORT")))
