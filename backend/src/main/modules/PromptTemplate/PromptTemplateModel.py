# Import the required modules
from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime
from jinja2 import Environment, Undefined, StrictUndefined
from ..User.UserModel import UserModel

class PromptTemplateModel(EncryptedDocument):
    """
    This is the PromptTemplateModel class that represents the prompt template document in MongoDB.

    The class has the following fields:
    - name (StringField): The name of the prompt template. It is a required field.
    - reference_key (StringField): The user readable identifier for the prompt template. It is a required field.
    - prompt_text (StringField): The prompt text field that prompts the LLM. It is a required field.
    - user (ReferenceField): The id for the owning user. It is a required field.
    - created_at (DateTimeField): The date and time when the author style was created.
                                  By default, it is set to the current date and time.
    - modified_at (DateTimeField): The date and time when the author style was last modified.
    """
    meta = {
        'collection': 'prompt_template',
        'encrypted_fields': ['prompt_text']
    }

    name = StringField(required=True)
    reference_key = StringField(required=True)
    prompt_text = StringField(required=True)
    user = ReferenceField(UserModel)
    created_at = DateTimeField(default=datetime.utcnow)
    modified_at = DateTimeField()

    def find_assigned_platform_settings(self):
        from main.modules.Admin.PlatformSettingModel import PlatformSettingModel  # Import here to avoid circular dependency

        assigned_settings = []
        all_settings = PlatformSettingModel.objects.all()

        for setting in all_settings:
            # Ensure the value is a dictionary and contains the relevant keys
            if isinstance(setting.value, dict) and ("system_role" in setting.value or "user_prompt" in setting.value):
                if str(self.id) in {setting.value.get("system_role", ""), setting.value.get("user_prompt", "")}:
                    assigned_settings.append(setting.key)

        return assigned_settings

    def to_dict(self):
        assigned_settings = self.find_assigned_platform_settings()

        return {
            "id": str(self.id),
            "name": self.name,
            "reference_key": self.reference_key,
            "prompt_text": self.prompt_text,
            "user_id": str(self.user.id),
            "creator_email": str(self.user.email),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "modified_at": self.modified_at.isoformat() if self.modified_at else None,
            "assigned_settings": assigned_settings,
        }

    def render(self, **kwargs):
        environment = Environment(
            block_start_string='[%',
            block_end_string='%]',
            variable_start_string='<<',
            variable_end_string='>>',
            undefined=StrictUndefined  # Raises an error on undefined variable, you can change as per your requirement
        )

        # Function to retrieve and render another template
        def include_prompt_template(name=None, key=None):
            if name is None and key is None:
                return "[Invalid template reference]"

            try:
                if name:
                    ref_template = PromptTemplateModel.objects.get(name=name, id__ne=self.id)
                elif key:
                    ref_template = PromptTemplateModel.objects.get(reference_key=key, id__ne=self.id)
            except DoesNotExist:
                return "[Template not found]"

            # Render the referenced template and return its content
            return ref_template.render(**kwargs)

        # Add custom function to Jinja2 environment globals
        environment.globals['prompt_template'] = include_prompt_template

        try:
            template = environment.from_string(self.prompt_text)
            return template.render(**kwargs)
        except Exception as e:
            raise e
