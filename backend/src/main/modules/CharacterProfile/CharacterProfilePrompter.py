from bson import ObjectId
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.config.settings import settings
from .CharacterProfileModel import CharacterProfileModel
from main.libraries.functions import extract_text_segment

class CharacterProfilePrompter:

    @staticmethod
    def prompt_from_seed(character_profile, text_seed=None, default_llm=None):

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[CharacterProfileModel]
        model_settings = settings.llm_model_settings[default_llm]

        from .CharacterProfileService import CharacterProfileService

        project = character_profile.project_id

        # Retrieve the latest story text for the project
        story_text = StoryTextService.get_story_text(project_id=project.id)
        # Retrieve the latest movie text for the project
        movie_text = story_text.text_content or "No movie text available."

        use_seed_text = text_seed or character_profile.text_seed

        profile_prompt = CharacterProfilePrompter.get_profile_prompt(project)

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting('prompts.generateCharacterFromSeed')

        # render system role text prompt template
        system_role_text = system_role_text.render(
                profile_prompt=profile_prompt,
                movie_text=movie_text,
                character_profile=character_profile,
                text_seed=use_seed_text,
        )

        # render system role text prompt template
        user_prompt_text = user_prompt_text.render(
                profile_prompt=profile_prompt,
                movie_text=movie_text,
                character_profile=character_profile,
                text_seed=use_seed_text,
        )

        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_text,
            'prompt_text': user_prompt_text,
        }


    @staticmethod
    def prompt_with_notes(character_profile, text_notes=None, default_llm=None, select_text_start=None, select_text_end=None):
        project = character_profile.project_id

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[CharacterProfileModel]
        model_settings = settings.llm_model_settings[default_llm]

        use_notes_text = text_notes or character_profile.text_notes

        # Determine if selective text is used
        selected_text = character_profile.text_content #default to full text
        if not selected_text:
            selected_text = ''

        if select_text_start is not None or select_text_end is not None:
            selected_text = extract_text_segment(selected_text, select_text_start, select_text_end)

        # Determine the prompt template names
        template_suffix = ".selective" if select_text_start is not None or select_text_end is not None else ""
        template_setting_name = f"prompts.generateCharacterWithNotes{template_suffix}"

        profile_prompt = CharacterProfilePrompter.get_profile_prompt(project)

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting(template_setting_name)

        system_role_text = system_role_text.render(
                profile_prompt=profile_prompt,
                character_profile=character_profile,
                text_notes=use_notes_text,
                selected_text=selected_text
        )

        user_prompt_text = user_prompt_text.render(
                profile_prompt=profile_prompt,
                character_profile=character_profile,
                text_notes=use_notes_text,
                selected_text=selected_text
        )

        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_text,
            'prompt_text': user_prompt_text,
        }

    @staticmethod
    def get_profile_prompt(project, document_type = 'CharacterProfile'):
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
