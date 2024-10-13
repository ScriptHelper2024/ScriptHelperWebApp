from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document
from mongoengine.fields import StringField, DateTimeField, ReferenceField
from datetime import datetime
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.User.UserModel import UserModel

class SuggestedStoryTitleModel(EncryptedDocument):
    meta = {
        'collection': 'suggested_story_titles',
        'encrypted_fields': ['title'],
    }

    project_id = ReferenceField('ProjectModel', required=True)
    title = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    created_by = ReferenceField('UserModel', required=True)

    def _to_dict(self):
        return {
            'id': str(self.id),
            'project_id': str(self.project_id.id),
            'title': self.title,
            'created_at': self.created_at,
            'created_by': str(self.created_by.id) if self.created_by else None
        }
