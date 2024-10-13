# Import the required modules
from mongoengine import Document, StringField, DynamicField, DateTimeField
from datetime import datetime

class PlatformSettingModel(Document):
    """
    This is the PlatformSettingModel class that represents platform settings documents in MongoDB.

    The class has the following fields:
    - key (StringField): The key used to reference/look up the setting internally. It is a required field.
    - value (DynamicField): The value of the setting, which can be of any type. It is flexible to handle different data types.
    - created_at (DateTimeField): The date and time when the setting was created. By default, it is set to the current date and time.
    - modified_at (DateTimeField): The date and time when the setting was last modified.
    """

    meta = {
        'collection': 'platform_settings'
    }

    key = StringField(required=True)
    value = DynamicField()
    created_at = DateTimeField(default=datetime.utcnow)
    modified_at = DateTimeField()

    def _to_dict(self):
        """
        Transforms the object for normalized API output.
        """
        return {
            "id": str(self.id),
            "key": self.key,
            "value": self.value,
            "created_at": self.created_at,
            "modified_at": self.modified_at,
        }
