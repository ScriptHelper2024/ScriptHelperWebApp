# Import required modules
from main.app import create_app
from dotenv import load_dotenv
import os
import sys

# Load environment variables from .env file
load_dotenv()

# Create the Flask app
app = create_app()

# If this script is run directly, do the following
if __name__ == "__main__":
    # Determine if the app is in production mode
    is_production = os.getenv('APP_ENV') == 'production'

    # Prevent running directly if in production environment
    if is_production:
        print("Running directly is not allowed in production environment.", file=sys.stderr)
        sys.exit(1)

    # Run the app in debug mode with threading enabled, unless in production
    app.run(debug=True, threaded=True, host="0.0.0.0")
