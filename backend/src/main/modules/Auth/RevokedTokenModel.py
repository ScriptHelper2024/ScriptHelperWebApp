from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime
from main.modules.User.UserModel import UserModel

class RevokedTokenModel(Document):
    meta = {'collection': 'revoked_tokens'}  # MongoDB collection

    # Fields for the RevokedTokenModel
    user = ReferenceField(UserModel, required=True)  # Refers to UserModel
    token_hash = StringField(required=True, unique=True)  # Unique token hash
    revoked_at = DateTimeField(default=datetime.utcnow)  # Token revocation timestamp
