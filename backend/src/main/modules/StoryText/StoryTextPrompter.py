from main.config.settings import settings
from .StoryTextModel import StoryTextModel
from bson import ObjectId
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.libraries.functions import extract_text_segment

class StoryTextPrompter:

    @staticmethod
    def prompt_from_seed(story_text, text_seed=None, default_llm=None):

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[StoryTextModel]
        model_settings = settings.llm_model_settings[default_llm]

        project = story_text.project_id
        target_length_str = project.metadata.get('target_length', '100')
        try:
            # Attempt to convert to an integer, default to 100 if it fails
            length_minutes = int(target_length_str)
        except ValueError:
            length_minutes = 100  # Default value if conversion fails
        movie_length_str = "";
        length_hours = int(length_minutes / 60);
        length_remaining_minutes = length_minutes - (int(length_hours * 60));

        if (length_hours == 0):
            movie_length_str = f"{length_minutes} minutes";
        else:
            movie_length_str = f"{length_hours} hours and {length_remaining_minutes} minutes";

        if text_seed:
            use_seed_text = text_seed #allow override
        else:
            use_seed_text = story_text.text_seed #use direct from model

        profile_prompt = StoryTextPrompter.get_profile_prompt(project)

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting('prompts.generateStoryFromSeed')

        #form the system role text
        system_role_text = system_role_text.render(
                profile_prompt=profile_prompt,
                length_minutes=length_minutes,
                movie_length_str=movie_length_str,
                text_seed=use_seed_text,
        )

        #form the user prompt text
        user_prompt_text = user_prompt_text.render(
                profile_prompt=profile_prompt,
                length_minutes=length_minutes,
                movie_length_str=movie_length_str,
                text_seed=use_seed_text,
        )

        return {
                'model': default_llm,
                'temperature': 0.7,
                'max_input_tokens': model_settings['max_input_tokens'],
                'max_output_tokens': model_settings['max_output_tokens'],
                'system_role': system_role_text,
                'prompt_text': user_prompt_text
            }


    @staticmethod
    def prompt_with_notes(story_text, text_notes=None, default_llm=None, select_text_start=None, select_text_end=None):
        if default_llm is None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[StoryTextModel]
        model_settings = settings.llm_model_settings[default_llm]

        project = story_text.project_id

        if text_notes:
            use_notes_text = text_notes
        else:
            use_notes_text = story_text.text_notes

        # Determine if selective text is used
        selected_text = story_text.text_content #default to full text
        if not selected_text:
            selected_text = ''

        if select_text_start is not None or select_text_end is not None:
            selected_text = extract_text_segment(selected_text, select_text_start, select_text_end)

        # Determine the prompt template names
        template_suffix = ".selective" if select_text_start is not None or select_text_end is not None else ""
        template_setting_key = f"prompts.generateStoryWithNotes{template_suffix}"

        profile_prompt = StoryTextPrompter.get_profile_prompt(project)

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting(template_setting_key)

        # Render the system role text
        system_role_text = system_role_text.render(
            profile_prompt=profile_prompt,
            story_text=story_text,
            text_notes=use_notes_text,
            selected_text=selected_text
        )

        # Render the user prompt text
        user_prompt_text = user_prompt_text.render(
            profile_prompt=profile_prompt,
            story_text=story_text,
            text_notes=use_notes_text,
            selected_text=selected_text
        )

        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_text,
            'prompt_text': user_prompt_text
        }

    @staticmethod
    def get_profile_prompt(project, document_type = 'StoryText'):
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
