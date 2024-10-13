# Import required modules
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from main.listeners import setup_listeners
from main.routes import setup_routes
from main.config.db import initialize_db
from main.config.platform import init_platform_settings
from main.libraries.functions import setup_opentelemetry
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

def create_app():
    # Create a Flask web server
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    # Initialize JWT Manager
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    jwt = JWTManager(app)

    # Initialize the database
    initialize_db()

    #init / sync our platform settings
    init_platform_settings()

    #setup listeners
    setup_listeners()

    if os.getenv('OPENTELEMETRY_ENABLED') == 'True':
        setup_opentelemetry(app)

    # Setup the routes for the app
    setup_routes(app)

    # Return the configured Flask app
    return app
