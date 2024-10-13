from mongoengine import Document, StringField, DateTimeField, ReferenceField
from main.modules.User.UserModel import UserModel
from datetime import datetime

class LoginHistoryModel(Document):
    meta = {'collection': 'login_history'}  # MongoDB collection

    # Fields for the LoginHistoryModel
    user = ReferenceField(UserModel, required=True)  # Refers to UserModel
    token_hash = StringField(required=True, unique=True)  # Unique token hash
    user_ip = StringField(required=True)  # IP address of the user
    logged_in_at = DateTimeField(default=datetime.utcnow)  # Login timestamp
