from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, DateTimeField, BooleanField, IntField, DictField
from datetime import datetime

class UserModel(EncryptedDocument):
    """
    UserModel represents a user document in MongoDB.

    Attributes:
        email (StringField): The email address of the user. It is a unique and required field.
        first_name (StringField) The users first name
        last_name (StringField) The users last / family name
        password (StringField): The hashed password of the user. It is a required field for authentication.
        created_at (DateTimeField): The timestamp when the user account was created. It defaults to the current UTC date and time when the user document is created.
        modified_at (DateTimeField): The timestamp when the user document was last updated. This field is meant to be updated every time the user's information changes.
        email_verified (BooleanField): A flag to indicate whether the user's email address has been verified. It defaults to False.
        verification_code (StringField): A randomly generated code for email verification purposes. This field can be used to store a verification token or code.
        verified_at (DateTimeField): The timestamp when the user's email address was verified. This field should be populated upon successful email verification.
        admin_level (IntField): An integer representing the level of administrative privileges the user has. It defaults to 0 (no admin privileges). Higher levels typically indicate more privileges.
        metadata (DictField): A dictionary field to store additional data related to the user. This could include OAuth provider data, user preferences, and other extendable metadata. It defaults to an empty dict.

    Meta:
        collection (str): The name of the MongoDB collection to store user documents. Set to 'users'.
    """

    meta = {
        'collection': 'users',
        'indexes': [
            'email',  # Index on the 'email' field for faster query performance.
        ],
        'ordering': ['-created_at'],  # Documents will be ordered by 'created_at' in descending order by default.
        'encrypted_fields': ['first_name', 'last_name'],
    }

    email = StringField(required=True, unique=True)
    first_name = StringField()
    last_name = StringField()
    password = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    modified_at = DateTimeField()
    email_verified = BooleanField(default=False)
    verification_code = StringField()
    verified_at = DateTimeField()
    admin_level = IntField(default=0)
    metadata = DictField(default=dict)

    def _to_dict(self):

        return {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'created_at': self.created_at,
            'modified_at': self.modified_at,
            'email_verified': self.email_verified,
            'verified_at': self.verified_at,
            'admin_level': self.admin_level,
        }
