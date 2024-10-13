# Import the required modules
from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, DateTimeField, BooleanField, IntField, ReferenceField
from datetime import datetime
from ..User.UserModel import UserModel
from ...libraries.FilteredDictionary import FilteredDictionary

class ScriptDialogFlavorModel(EncryptedDocument, FilteredDictionary):
    """
    This is the ScriptDialogFlavorModel class that represents the script dialog flavor document in MongoDB.

    The class has the following fields:
    - name (StringField): The name of the script dialog flavor. It is a required field.
    - prompt_text (StringField): The prompt text field to elicit the script dialog flavor. It is a required field.
    - user_id (IntField): The id for the owning user, or 'None' if global. It is a required field.
    - active (BoolField): If the script dialog flavor is available to users. It is a required field.
    - created_at (DateTimeField): The date and time when the script dialog flavor was created.
                                  By default, it is set to the current date and time.
    - modified_at (DateTimeField): The date and time when the script dialog flavor was last modified.
    """
    meta = {
        'collection': 'script_dialog_flavors',
        'encrypted_fields': ['name', 'prompt_text']           
    }

    name = StringField(required=True)
    prompt_text = StringField(required=True)
    user = ReferenceField(UserModel)  # Refers to UserModel
    archived = BooleanField(required=False, default=False)
    is_global = BooleanField(required=False, default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    modified_at = DateTimeField()

    private = [
        "prompt_text",
    ]

    def _to_dict(self):
        return {
           "id": str(self.id),
           "name": self.name,
           "prompt_text": self.prompt_text,
           "user_id": str(self.user.id),
           "creator_email": str(self.user.email),
           "archived": self.archived,
           "is_global": self.is_global,
           "created_at": self.created_at,
           "modified_at": self.modified_at,
        }
