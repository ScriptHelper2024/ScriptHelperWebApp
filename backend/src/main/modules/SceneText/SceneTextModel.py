from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, ReferenceField, IntField, DictField, DateTimeField, UUIDField
from datetime import datetime
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.User.UserModel import UserModel
from mongoengine.errors import DoesNotExist
import uuid
from main.libraries.functions import log_message

class SceneTextModel(EncryptedDocument):
    """
    SceneTextModel represents a scene text document in MongoDB.

    Attributes:
        project_id (ReferenceField): A reference to the associated project document.
        scene_key (UUIDField): A unique identifier for the scene, shared across all versions.
        title (StringField): The title of the scene.
        scene_order (IntField): The order of the scene within the project.
        version_type (StringField): Type of the version (base, edit, note, seed, generation).
        source_version (ReferenceField): A reference to the source version document.
        version_number (IntField): An incremental number that represents the version of the text.
        version_label (StringField): A label for the version, can be optional.
        text_seed (StringField): The seed text used to generate or mutate the scene text.
        text_notes (StringField): Notes associated with the text content.
        text_content (StringField): The actual text content of this version.
        character_count (IntField): Number of characters in the text content.
        llm_model (StringField): The name or identifier of the LLM model used to generate the text.
        created_at (DateTimeField): The timestamp when this version was created.
        created_by (ReferenceField): A reference to the user who created this version.
    """

    meta = {
        'collection': 'scene_texts',
        'indexes': [
            'project_id',
            'scene_key',
            'version_number',
            'scene_order',
            'created_at',
        ],
        'ordering': ['scene_order', '-created_at'], # Ordered by 'scene_order' and 'created_at' in descending order by default.
        'encrypted_fields': ['title', 'text_seed', 'text_notes', 'text_content', 'version_label'],
    }

    project_id = ReferenceField(ProjectModel, required=True)
    scene_key = UUIDField(binary=False, default=uuid.uuid4, unique=False)
    title = StringField()
    scene_order = IntField()
    version_type = StringField(required=True, choices=('base', 'edit', 'note', 'magic-note', 'new', 'seed', 'generation'))
    source_version = ReferenceField('self')  # Allows reference to another SceneTextModel document.
    version_number = IntField(required=True)
    version_label = StringField()
    text_seed = StringField()
    text_notes = StringField()
    text_content = StringField()
    character_count = IntField()
    llm_model = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    created_by = ReferenceField(UserModel, required=True)

    def getLatestBeatSheetId(self):
        """
        Retrieves the latest beat sheet ID for this scene text, creating a new
        one if necessary.

        :return: The ID of the latest beat sheet.
        """

        from main.modules.BeatSheet.BeatSheetService import BeatSheetService

        try:
            user = self.created_by
            if not user:
                raise DoesNotExist
        except DoesNotExist:
            # Handle the case where 'created_by' does not reference an existing user
            # This could involve setting a default user or handling the error appropriately
            raise ValueError("User does not exist")

        scene_text_id = str(self.id)
        scene_key = str(self.scene_key)

        # Call init_beat_sheet to get the latest or create a new beat sheet
        latest_beat_sheet_id = BeatSheetService.init_beat_sheet(scene_key, user, scene_text_id)

        return latest_beat_sheet_id

    def getLatestScriptTextId(self):
        """
        Retrieves the latest script text ID for this scene text, creating a new
        one if necessary.

        :return: The ID of the latest script text.
        """

        from main.modules.ScriptText.ScriptTextService import ScriptTextService

        try:
            user = self.created_by
            if not user:
                raise DoesNotExist
        except DoesNotExist:
            # Handle the case where 'created_by' does not reference an existing user
            # This could involve setting a default user or handling the error appropriately
            raise ValueError("User does not exist")

        scene_text_id = str(self.id)
        scene_key = str(self.scene_key)

        # Call init_script_text to get the latest or create a new beat sheet
        latest_script_text_id = ScriptTextService.init_script_text(scene_key, user, scene_text_id)

        return latest_script_text_id

    def getProject(self):
        return self.project_id

    def _to_dict(self):
        try:
            created_by_id = str(self.created_by.id) if self.created_by else None
        except Exception as e:
            # Log the exception for debugging purposes
            #log_message('error', f"Error resolving created_by field: {e}")
            created_by_id = None

        latest_beat_sheet_id = self.getLatestBeatSheetId()
        latest_script_text_id = self.getLatestScriptTextId()

        return {
            'id': str(self.id),
            'project_id': str(self.project_id.id),
            'scene_key': str(self.scene_key),
            'title': self.title,
            'scene_order': self.scene_order,
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
            'created_by': created_by_id,
            'latest_beat_sheet_id': latest_beat_sheet_id,
            'latest_script_text_id': latest_script_text_id
        }
