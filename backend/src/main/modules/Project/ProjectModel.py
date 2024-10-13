from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import (
    Document,
    StringField,
    BooleanField,
    DateTimeField,
    EmbeddedDocument,
    EmbeddedDocumentListField,
    ReferenceField,
    DictField
)
import datetime
from main.modules.User.UserModel import UserModel

# Define the Role class to store user roles within a project
class ProjectRole(EmbeddedDocument):
    user = ReferenceField(UserModel)
    role = StringField(required=True, default='owner')

# Define the Project model
class ProjectModel(EncryptedDocument):
    meta = {
        'collection': 'projects',
        'encrypted_fields': ['title']
    }

    title = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)
    archived = BooleanField(default=False)
    metadata = DictField()  # Or MapField if needed, for storing arbitrary metadata

    # Define a list of roles for users with access to the project
    members = EmbeddedDocumentListField(ProjectRole)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(ProjectModel, self).save(*args, **kwargs)

    def get_owner_user(self):
        """
        Find the first user with the role 'owner' and return the UserModel object.

        :return: UserModel instance or None if no owner is found.
        """
        # Iterate through the project members to find the owner
        owner_member = next((member for member in self.members if member.role == 'owner'), None)

        # If an owner member is found, retrieve and return the UserModel object
        if owner_member:
            owner_user = UserModel.objects(id=owner_member.user.id).first()
            if owner_user:
                return owner_user

        # Return None or raise an exception if no owner is found
        return None

    def getLatestStoryTextId(self):
        from main.modules.StoryText.StoryTextService import StoryTextService

        # Call the new get_owner_user method to retrieve the owner's UserModel object
        owner_user = self.get_owner_user()
        if not owner_user:
            raise Exception('No owner user found for this project')

        # Now we have the owner user, we can call the StoryTextService's method
        story_text = StoryTextService.init_story_text(self.id, owner_user)
        return story_text

    def _to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'archived': self.archived,
            'metadata': self.metadata,
            'members': [{'user': str(member.user.id), 'role': member.role} for member in self.members],
            'latest_story_text_id': str(self.getLatestStoryTextId())
        }
