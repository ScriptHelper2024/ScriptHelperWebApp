from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, ReferenceField, IntField, DateTimeField, UUIDField
from datetime import datetime
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.User.UserModel import UserModel
import uuid

class BeatSheetModel(EncryptedDocument):
    """
    BeatSheetModel represents a beat sheet document in MongoDB.

    Attributes:
        scene_key (ReferenceField): A reference to the scene_key field from SceneTextModel.
        version_type (StringField): Type of the version (base, edit, note, new, seed, generation).
        source_version (ReferenceField): A reference to the source version document.
        version_number (IntField): An incremental number that represents the version of the beat sheet.
        version_label (StringField): A label for the version, can be optional.
        scene_text_id (ReferenceField): A reference to the specific version of the scene text document.
        text_notes (StringField): Notes associated with the beat sheet content.
        text_content (StringField): The actual text content of this version.
        character_count (IntField): Number of characters in the beat sheet content.
        llm_model (StringField): The name or identifier of the LLM model used to generate the beat sheet.
        created_at (DateTimeField): The timestamp when this version was created.
        created_by (ReferenceField): A reference to the user who created this version.
    """

    meta = {
        'collection': 'beat_sheets',
        'indexes': [
            'scene_key',
            'version_number',
            'created_at',
        ],
        'ordering': ['-created_at'],  # Documents will be ordered by 'created_at' in descending order by default.
        'encrypted_fields': ['text_notes', 'text_content', 'version_label'], 
    }

    scene_key = UUIDField(binary=False, default=uuid.uuid4, unique=False)
    version_type = StringField(required=True, choices=('base', 'edit', 'note', 'magic-note', 'new', 'seed', 'generation'))
    source_version = ReferenceField('self')  # Allows reference to another BeatSheetModel d    version_number = IntField(required=True)
    version_number = IntField(required=True)
    version_label = StringField()
    scene_text_id = ReferenceField(SceneTextModel)  # Reference to a specific scene text version.
    text_notes = StringField()
    text_content = StringField()
    character_count = IntField()
    llm_model = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    created_by = ReferenceField(UserModel, required=True)

    def getProject(self):
        scene_text = SceneTextModel.objects(scene_key=self.scene_key).first()
        return scene_text.project_id

    def scene(self):
        return scene_text_id

    def _to_dict(self):
        return {
            'id': str(self.id),
            'scene_key': str(self.scene_key),
            'version_type': self.version_type,
            'source_version_number': self.source_version.version_number if self.source_version else None,
            'version_number': self.version_number,
            'version_label': self.version_label,
            'scene_text_id': str(self.scene_text_id.id) if self.scene_text_id else None,  # New field for specific scene version
            'text_notes': self.text_notes,
            'text_content': self.text_content,
            'character_count': self.character_count,
            'llm_model': self.llm_model,
            'created_at': self.created_at,
            'created_by': str(self.created_by.id) if self.created_by else None
        }
