from mongoengine import Document, StringField, DateTimeField, ReferenceField
from main.modules.User.UserModel import UserModel
from datetime import datetime

class PasswordResetRequestModel(Document):
    meta = {'collection': 'password_reset_requests'}  # MongoDB collection

    # Fields for the PasswordResetRequestModel
    user = ReferenceField(UserModel)  # Refers to UserModel
    reset_code = StringField(required=True, unique=True)  # Unique reset code
    status = StringField(default="pending")  # Request status, defaults to "pending"
    timestamp = DateTimeField(default=datetime.utcnow)  # Request timestamp
    ip_address = StringField(required=True)  # IP address of the request
