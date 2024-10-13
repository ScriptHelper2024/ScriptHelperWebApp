from bson import ObjectId
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.config.settings import settings
from .SceneTextModel import SceneTextModel
from main.libraries.functions import extract_text_segment

class SceneTextPrompter:

    @staticmethod
    def prompt_from_seed(scene_text, text_seed=None, default_llm=None):

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[SceneTextModel]
        model_settings = settings.llm_model_settings[default_llm]

        from .SceneTextService import SceneTextService

        project = scene_text.project_id

        # Retrieve the latest story text for the project
        story_text = StoryTextService.get_story_text(project_id=project.id)
        # Retrieve the latest movie text for the project
        movie_text = story_text.text_content or "No movie text available."
        # Retrieve all scenes for the project and sort them by their order
        all_scenes = SceneTextService.list_project_scenes(project.id)
        # Retrieve the preceding scenes by their order
        preceding_scenes = [s for s in all_scenes if s['scene_order'] < scene_text.scene_order]

        # Retrieve the immediately preceding scene
        immediately_preceding_scene = len(preceding_scenes) and SceneTextService.get_scene_text(preceding_scenes[-1]['id'])

        use_seed_text = text_seed or scene_text.text_seed

        profile_prompt = SceneTextPrompter.get_profile_prompt(project)

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting('prompts.generateSceneFromSeed')

        # render system role text prompt template
        system_role_text = system_role_text.render(
                profile_prompt=profile_prompt,
                movie_text=movie_text,
                scene_text=scene_text,
                preceding_scenes=preceding_scenes,
                immediately_preceding_scene=immediately_preceding_scene,
                text_seed=use_seed_text,
        )

        # render system role text prompt template
        user_prompt_text = user_prompt_text.render(
                profile_prompt=profile_prompt,
                movie_text=movie_text,
                scene_text=scene_text,
                preceding_scenes=preceding_scenes,
                immediately_preceding_scene=immediately_preceding_scene,
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
    def prompt_with_notes(scene_text, text_notes=None, default_llm=None, select_text_start=None, select_text_end=None):
        project = scene_text.project_id

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[SceneTextModel]
        model_settings = settings.llm_model_settings[default_llm]

        use_notes_text = text_notes or scene_text.text_notes

        # Determine if selective text is used
        selected_text = scene_text.text_content #default to full text
        if not selected_text:
            selected_text = ''

        if select_text_start is not None or select_text_end is not None:
            selected_text = extract_text_segment(selected_text, select_text_start, select_text_end)

        # Determine the prompt template names
        template_suffix = ".selective" if select_text_start is not None or select_text_end is not None else ""
        template_setting_name = f"prompts.generateSceneWithNotes{template_suffix}"

        profile_prompt = SceneTextPrompter.get_profile_prompt(project)

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting(template_setting_name)

        system_role_text = system_role_text.render(
                profile_prompt=profile_prompt,
                scene_text=scene_text,
                text_notes=use_notes_text,
                selected_text=selected_text
        )

        user_prompt_text = user_prompt_text.render(
                profile_prompt=profile_prompt,
                scene_text=scene_text,
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
    def prompt_make_scenes(story_text, scene_count=24, default_llm=None):

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[SceneTextModel]
        model_settings = settings.llm_model_settings[default_llm]

        project = story_text.project_id
        profile_prompt = SceneTextPrompter.get_profile_prompt(project, 'MakeScenes')

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting('prompts.generateMakeScenes')

        system_role_text = system_role_text.render(
            profile_prompt = profile_prompt,
            story_text = story_text,
            scene_count = scene_count
        )

        user_prompt_text = user_prompt_text.render(
            story_text = story_text,
            scene_count = scene_count
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
    def get_profile_prompt(project, document_type = 'SceneText'):
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
