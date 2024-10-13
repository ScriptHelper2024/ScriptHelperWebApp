from mongoengine.connection import _get_connection
from mongomock import MongoClient
from mongoengine import connect, disconnect
import os

def initialize_db(connection_uri=None, reconnect=False):
    """
    Establish a connection to the MongoDB database with an optional reconnect parameter.
    """

    # Check for an existing connection
    existing_connection = None
    try:
        existing_connection = _get_connection()
    except:
        pass  # No existing connection found

    # If reconnect is False and there is an existing connection, return it
    if not reconnect and existing_connection:
        return existing_connection

    # Proceed with establishing a new connection
    disconnect()  # ensure previous connections are closed

    if connection_uri:
        return connect(host=connection_uri, mongo_client_class=MongoClient, db="testdb", uuidRepresentation='standard')
    else:
        return connect(
            db=os.getenv('DB_NAME'),
            host=os.getenv('DB_HOST'),
            port=int(os.getenv('DB_PORT')),
            username=os.getenv('DB_USERNAME'),
            password=os.getenv('DB_PASSWORD'),
            uuidRepresentation='standard'
        )
