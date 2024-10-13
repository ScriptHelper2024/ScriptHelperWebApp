from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, ReferenceField, IntField, DictField, DateTimeField, UUIDField
from datetime import datetime
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.User.UserModel import UserModel
from mongoengine.errors import DoesNotExist
import uuid
from main.libraries.functions import log_message

class LocationProfileModel(EncryptedDocument):
    """
    LocationProfileModel represents a location text document in MongoDB.

    Attributes:
        project_id (ReferenceField): A reference to the associated project document.
        location_key (UUIDField): A unique identifier for the location, shared across all versions.
        name (StringField): The name of the location
        location_order (IntField): The order of the location within the project.
        version_type (StringField): Type of the version (base, edit, note, seed, generation).
        source_version (ReferenceField): A reference to the source version document.
        version_number (IntField): An incremental number that represents the version of the text.
        version_label (StringField): A label for the version, can be optional.
        text_seed (StringField): The seed text used to generate or mutate the location text.
        text_notes (StringField): Notes associated with the text content.
        text_content (StringField): The actual text content of this version.
        location_count (IntField): Number of locations in the text content.
        llm_model (StringField): The name or identifier of the LLM model used to generate the text.
        created_at (DateTimeField): The timestamp when this version was created.
        created_by (ReferenceField): A reference to the user who created this version.
    """

    meta = {
        'collection': 'location_profiles',
        'indexes': [
            'project_id',
            'location_key',
            'version_number',
            'location_order',
            'created_at',
        ],
        'ordering': ['location_order', '-created_at'], # Ordered by 'location_order' and 'created_at' in descending order by default.
        'encrypted_fields': ['name', 'text_seed', 'text_notes', 'text_content', 'version_label'],
    }

    project_id = ReferenceField(ProjectModel, required=True)
    location_key = UUIDField(binary=False, default=uuid.uuid4, unique=False)
    name = StringField()
    location_order = IntField()
    version_type = StringField(required=True, choices=('base', 'edit', 'note', 'magic-note', 'new', 'seed', 'generation'))
    source_version = ReferenceField('self')  # Allows reference to another LocationProfileModel document.
    version_number = IntField(required=True)
    version_label = StringField()
    text_seed = StringField()
    text_notes = StringField()
    text_content = StringField()
    location_count = IntField()
    llm_model = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    created_by = ReferenceField(UserModel, required=True)

    def getProject(self):
        return self.project_id

    def _to_dict(self):
        try:
            created_by_id = str(self.created_by.id) if self.created_by else None
        except Exception as e:
            # Log the exception for debugging purposes
            #log_message('error', f"Error resolving created_by field: {e}")
            created_by_id = None

        return {
            'id': str(self.id),
            'project_id': str(self.project_id.id),
            'location_key': str(self.location_key),
            'name': self.name,
            'location_order': self.location_order,
            'version_type': self.version_type,
            'source_version_number': self.source_version.version_number if self.source_version else None,
            'version_number': self.version_number,
            'version_label': self.version_label,
            'text_seed': self.text_seed,
            'text_notes': self.text_notes,
            'text_content': self.text_content,
            'location_count': self.location_count,
            'llm_model': self.llm_model,
            'created_at': self.created_at,
            'created_by': created_by_id,
        }
