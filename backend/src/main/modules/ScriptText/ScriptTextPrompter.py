from bson import ObjectId
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from .ScriptTextModel import ScriptTextModel
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.config.settings import settings
from main.libraries.functions import extract_text_segment

class ScriptTextPrompter:

    @staticmethod
    def prompt_from_scene(script_text, scene_text, beat_sheet=None, author_style=None, style_guideline=None, script_dialog_flavor=None, screenplay_format=False, default_llm=None):
        # Fetch project related to the script_text
        project = script_text.getProject()

        story_text_id = project.getLatestStoryTextId()
        story_text = StoryTextModel.objects(id=story_text_id).first()

        profile_prompt = ScriptTextPrompter.get_profile_prompt(project)

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[ScriptTextModel]
        model_settings = settings.llm_model_settings[default_llm]

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting('prompts.generateScriptTextFromScene')

        # Render the prompts based on the template with provided context
        system_role_text = system_role_text.render(
            profile_prompt=profile_prompt,
            story_text=story_text,
            scene_text=scene_text,
            beat_sheet=beat_sheet,
            author_style=author_style,
            style_guideline=style_guideline,
            script_dialog_flavor=script_dialog_flavor,
            screenplay_format=screenplay_format,
        )

        user_prompt_text = user_prompt_text.render(
            profile_prompt=profile_prompt,
            story_text=story_text,
            scene_text=scene_text,
            beat_sheet=beat_sheet,
            author_style=author_style,
            style_guideline=style_guideline,
            script_dialog_flavor=script_dialog_flavor,
            screenplay_format=screenplay_format,
        )

        # Construct the prompt data dict with the rendered text
        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_text,
            'prompt_text': user_prompt_text
        }

    @staticmethod
    def prompt_with_notes(script_text, scene_text, text_notes=None, beat_sheet=None, author_style=None, style_guideline=None, script_dialog_flavor=None, screenplay_format=False, default_llm=None, select_text_start=None, select_text_end=None):
        # Fetch project related to the script_text
        project = script_text.getProject()

        # Determine the prompt template names
        template_suffix = ".selective" if select_text_start is not None or select_text_end is not None else ""
        template_setting_name = f"prompts.generateScriptTextWithNotes{template_suffix}"

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting(template_setting_name)

        story_text_id = project.getLatestStoryTextId()
        story_text = StoryTextModel.objects(id=story_text_id).first()

        profile_prompt = ScriptTextPrompter.get_profile_prompt(project)

        # Use the provided text_notes or the existing ones in script_text
        use_notes_text = text_notes if text_notes is not None else script_text.text_notes

        # Determine if selective text is used
        selected_text = script_text.text_content #default to full text
        if not selected_text:
            selected_text = ''

        if select_text_start is not None or select_text_end is not None:
            selected_text = extract_text_segment(selected_text, select_text_start, select_text_end)

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[ScriptTextModel]
        model_settings = settings.llm_model_settings[default_llm]

        # Render the prompts based on the template with provided context
        system_role_text = system_role_text.render(
            profile_prompt=profile_prompt,
            story_text=story_text,
            scene_text=scene_text,
            beat_sheet=beat_sheet,
            author_style=author_style,
            style_guideline=style_guideline,
            script_dialog_flavor=script_dialog_flavor,
            screenplay_format=screenplay_format,
            script_text=script_text,
            text_notes=use_notes_text,
            selected_text=selected_text
        )

        user_prompt_text = user_prompt_text.render(
            profile_prompt=profile_prompt,
            story_text=story_text,
            scene_text=scene_text,
            beat_sheet=beat_sheet,
            author_style=author_style,
            style_guideline=style_guideline,
            script_dialog_flavor=script_dialog_flavor,
            screenplay_format=screenplay_format,
            script_text=script_text,
            text_notes=use_notes_text,
            selected_text=selected_text
        )

        # Construct the prompt data dict with the rendered text
        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_text,
            'prompt_text': user_prompt_text
        }


    @staticmethod
    def get_profile_prompt(project, document_type = 'ScriptText'):
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
