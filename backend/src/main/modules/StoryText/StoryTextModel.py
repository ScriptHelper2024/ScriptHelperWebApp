from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, ReferenceField, IntField, DictField, DateTimeField
from datetime import datetime
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.User.UserModel import UserModel

class StoryTextModel(EncryptedDocument):
    """
    StoryTextModel represents a story text document in MongoDB.

    Attributes:
        project_id (ReferenceField): A reference to the associated project document.
        version_type (StringField): Type of the version (base, edit, note, seed).
        source_version (ReferenceField): A reference to the source version document.
        version_number (IntField): An incremental number that represents the version of the text.
        version_label (StringField): A label for the version, can be optional.
        text_seed (StringField): The seed text used to generate or mutate the story text.
        text_notes (StringField): Notes associated with the text content.
        text_content (StringField): The actual text content of this version.
        character_count (IntField): Number of characters in the text content.
        llm_model (StringField): The name or identifier of the LLM model used to generate the text.
        created_at (DateTimeField): The timestamp when this version was created.
        created_by (ReferenceField): A reference to the user who created this version.
    """

    meta = {
        'collection': 'story_texts',
        'indexes': [
            'project_id',
            'version_number',
            'created_at',
        ],
        'ordering': ['-created_at'],  # Documents will be ordered by 'created_at' in descending order by default.
        'encrypted_fields': ['text_seed', 'text_notes', 'text_content', 'version_label'], 
    }

    project_id = ReferenceField(ProjectModel, required=True)
    version_type = StringField(required=True, choices=('base', 'edit', 'note', 'magic-note', 'new', 'seed', 'generation'))
    source_version = ReferenceField('self')  # Allows reference to another StoryTextModel document.
    version_number = IntField(required=True)
    version_label = StringField()
    text_seed = StringField()
    text_notes = StringField()
    text_content = StringField()
    character_count = IntField()
    llm_model = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    created_by = ReferenceField(UserModel, required=True)

    def getProject(self):
        return self.project_id

    def _to_dict(self):
        return {
            'id': str(self.id),
            'project_id': str(self.project_id.id),
            'version_type': self.version_type,
            'source_version_number': self.source_version.version_number if self.source_version else None,
            'version_number': self.version_number,
            'version_label': self.version_label,
            'text_seed': self.text_seed,
            'text_notes': self.text_notes,
            'text_content': self.text_content,
            'character_count': self.character_count,
            'llm_model': self.llm_model,
            'created_at': self.created_at,
            'created_by': str(self.created_by.id) if self.created_by else None
        }
