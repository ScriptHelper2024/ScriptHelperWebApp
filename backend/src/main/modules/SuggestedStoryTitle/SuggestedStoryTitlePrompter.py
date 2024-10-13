from bson import ObjectId
from .SuggestedStoryTitleModel import SuggestedStoryTitleModel
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.config.settings import settings

class SuggestedStoryTitlePrompter:

    @staticmethod
    def prompt_make_suggestion(story_text, default_llm=None):

        if default_llm == None or default_llm == 'auto':
            default_llm = settings.default_llm_for_module[SuggestedStoryTitleModel]
        model_settings = settings.llm_model_settings[default_llm]

        #load templates based on platform settings
        system_role_text, user_prompt_text = PromptTemplateService.get_templates_for_setting('prompts.generateTitleSuggestion')

        #form the system role text
        system_role_text = system_role_text.render(
            story_text=story_text
        )

        #form the user prompt text
        user_prompt_text = user_prompt_text.render(
            story_text=story_text
        )

        return {
            'model': default_llm,
            'temperature': 0.7,
            'max_input_tokens': model_settings['max_input_tokens'],
            'max_output_tokens': model_settings['max_output_tokens'],
            'system_role': system_role_text,
            'prompt_text': user_prompt_text
        }
