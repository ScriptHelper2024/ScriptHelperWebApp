# Import the required modules
from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime
from jinja2 import Environment
from ..User.UserModel import UserModel

class UserPreferenceModel(Document):
    """
    This is the UserPreferenceModel class that represents the user preferences document in MongoDB.

    The class has the following fields:
    - default_llm (StringField): The default large language model to use when creating AI text generation tasks
    - user (ReferenceField(UserModel)): The user associated with the user preferences
    """
    meta = {
        'collection': 'user_preferences'
    }

    default_llm = StringField(required=True)
    user = ReferenceField(UserModel)
    
    def to_dict(self):
        return {
            "default_llm": self.default_llm
        }

    # todo: Find out what this is for
    def render(self, **kwargs):
        try:
            template = Environment(
                    block_start_string='[%',
                    block_end_string='%]',
                    variable_start_string='<<',
                    variable_end_string='>>',
            ).from_string(self.default_llm)
            return template.render(**kwargs)
        except Exception as e:
            raise e
