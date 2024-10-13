from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, ReferenceField, BooleanField, IntField, DateTimeField
from datetime import datetime
from main.modules.User.UserModel import UserModel
import uuid

class MagicNoteCriticModel(EncryptedDocument):
    """
    MagicNoteCriticModel represents a magic note critic document in MongoDB.

    Attributes:
        user_id (ReferenceField): A reference to the admin user who created or modified the critic.
        active (BooleanField): Indicates whether the critic is active and should be used.
        name (StringField): The name of the critic.
        order_rank (IntField): The rank order of the critic to determine the sequence of application and display.
        story_text_prompt (StringField): The prompt text for story text critiques.
        scene_text_prompt (StringField): The prompt text for scene text critiques.
        beat_sheet_prompt (StringField): The prompt text for beat sheet critiques.
        script_text_prompt (StringField): The prompt text for script text critiques.
        created_at (DateTimeField): The timestamp when the critic was created.
        updated_at (DateTimeField): The timestamp when the critic was last updated.
    """

    meta = {
        'collection': 'magic_note_critics',
        'indexes': [
            'user_id',
            'active',
            'name',
            'order_rank',
            'created_at',
            'updated_at',
        ],
        'ordering': ['order_rank'],  # Documents will be ordered by 'order_rank' in ascending order by default.
        'encrypted_fields': ['name', 'story_text_prompt', 'scene_text_prompt', 'beat_sheet_prompt', 'script_text_prompt'],
    }

    user_id = ReferenceField(UserModel, required=True)
    active = BooleanField(default=True)
    name = StringField(required=True)
    order_rank = IntField(required=True)
    story_text_prompt = StringField()
    scene_text_prompt = StringField()
    beat_sheet_prompt = StringField()
    script_text_prompt = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return f"MagicNoteCritic(name={self.name}, active={self.active}, order_rank={self.order_rank})"

    def _to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id.id),
            'user_email': str(self.user_id.email),
            'active': self.active,
            'name': self.name,
            'order_rank': self.order_rank,
            'story_text_prompt': self.story_text_prompt,
            'scene_text_prompt': self.scene_text_prompt,
            'beat_sheet_prompt': self.beat_sheet_prompt,
            'script_text_prompt': self.script_text_prompt,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
