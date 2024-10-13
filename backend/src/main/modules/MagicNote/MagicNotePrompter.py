from bson import ObjectId
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.modules.Project.ProjectModel import ProjectModel
from .MagicNoteCriticModel import MagicNoteCriticModel
from main.config.settings import settings
import re

class MagicNotePrompter:

    @staticmethod
    def camel_to_snake(name):
        """
        Converts CamelCase to snake_case.
        """
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()

    @staticmethod
    def get_profile_prompt(project, document_type):
        # Ensure project.metadata exists, if not, create an empty dict for it
        if not hasattr(project, 'metadata') or project.metadata is None:
            project.metadata = {}

        # Define a list of keys with their default values that must exist in metadata
        default_metadata_keys = {
            'genre': "",
            'audiences': "",
            'age_rating': "",
            'budget': "",
            'guidance': "",
        }

        # Ensure each key exists in project.metadata with its default value if not already set
        for key, default_value in default_metadata_keys.items():
            project.metadata.setdefault(key, default_value)

        # Check if the metadata and apply_profile_when_generating exist
        apply_profile = project.metadata.get('apply_profile_when_generating', {})

        # If apply_profile has the key matching document_type and it's set to False, return an empty string
        if apply_profile.get(document_type) is False:
            return ""

        # Otherwise, proceed to render the project profile prompt using the PromptTemplateModel
        project_profile_prompt = PromptTemplateModel.objects.get(name="project_profile_prompt")
        return project_profile_prompt.render(project=project)

    @staticmethod
    def prompt_magic_notes(document_type, document, critics=None, default_llm=None):
        # Load the project from the document
        project = document.getProject()
        document_type_snake = MagicNotePrompter.camel_to_snake(document_type)

        # Form the profile prompt
        profile_prompt = MagicNotePrompter.get_profile_prompt(project, document_type_snake)

        # Determine the correct LLM for the module based on the document type
        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[MagicNoteCriticModel]
        model_settings = settings.llm_model_settings[default_llm]

        # Load system role and user prompt templates based on document type
        template_setting_name = f"prompts.generateMagicNotes.{document_type_snake}"

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting(template_setting_name)

        system_role_rendered = system_role_text.render(
            project=project,
            critics=critics,
            profile_prompt=profile_prompt,
            **{document_type_snake: document}
        )

        user_prompt_rendered = user_prompt_text.render(
            project=project,
            critics=critics,
            profile_prompt=profile_prompt,
            **{document_type_snake: document}
        )

        # Return the prompt data
        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_rendered,
            'prompt_text': user_prompt_rendered
        }

    @staticmethod
    def prompt_expansive_notes(document_type, document, default_llm=None):
        # Load the project from the document
        project = document.getProject()
        document_type_snake = MagicNotePrompter.camel_to_snake(document_type)

        # Form the profile prompt
        profile_prompt = MagicNotePrompter.get_profile_prompt(project, document_type_snake)

        target_percent = 10
        if document_type == 'StoryText':
            target_length_str = project.metadata.get('target_length', '100')
            try:
                # Attempt to convert to an integer, default to 100 if it fails
                length_minutes = int(target_length_str)
            except ValueError:
                length_minutes = 100  # Default value if conversion fails

            document_text = document.text_content
            if not document_text:
                document_text = ''

            current_text_length = len(document_text)
            if current_text_length <= 0:
                current_text_length = 1 #avoid division by zero

            target_text_length = length_minutes * 100 #100 characters of text per minute of runtime we want - rough value
            current_percent = (float(target_text_length) / float(current_text_length)) * 100
            target_percent = int(current_percent - 100)
            if target_percent < 10:
                target_percent = 10 #make 10% the minimum increase level instead of throwing an error

        # Determine the correct LLM for the module based on the document type
        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[MagicNoteCriticModel]
        model_settings = settings.llm_model_settings[default_llm]

        # Load system role and user prompt templates based on document type
        template_setting_name = f"prompts.generateExpansiveNotes.{document_type_snake}"

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting(template_setting_name)

        system_role_rendered = system_role_text.render(
            project=project,
            target_percent=str(target_percent),
            profile_prompt=profile_prompt,
            **{document_type_snake: document}
        )

        user_prompt_rendered = user_prompt_text.render(
            project=project,
            target_percent=str(target_percent),
            profile_prompt=profile_prompt,
            **{document_type_snake: document}
        )

        # Return the prompt data
        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_rendered,
            'prompt_text': user_prompt_rendered
        }
