from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleModel import SuggestedStoryTitleModel
from main.modules.MagicNote.MagicNoteCriticModel import MagicNoteCriticModel
from main.modules.CharacterProfile.CharacterProfileModel import CharacterProfileModel
from main.modules.LocationProfile.LocationProfileModel import LocationProfileModel


class settings():

    record_limit = 25

   # List of available models with their friendly names and model IDs
    llm_options = {
        # 'friendly_name': ('model_id', 'Friendly Name')
        'Auto': ('auto', 'Auto'),
        'GPT-3.5 Turbo': ('gpt-3.5-turbo', 'GPT-3.5 Turbo'),
        'GPT-3.5 Turbo 16k': ('gpt-3.5-turbo-16k-0613', 'GPT-3.5 Turbo 16k'),
        'GPT-4-0613': ('gpt-4-0613', 'GPT-4-0613'),
		'GPT-4': ('gpt-4', 'GPT-4'),
        'GPT-4-Turbo-128K': ('gpt-4-turbo-preview', 'GPT-4-Turbo-128K'),
        'GPT-4o': ('gpt-4o', 'GPT-4o'),
        'GPT-3.5 Instruct': ('gpt-3.5-instruct', 'GPT-3.5 Instruct'),
        'GPT-3.5 Turbo New': ('gpt-3.5-turbo-0125', 'GPT-3.5 Turbo New'),
        'Claude 2': ('claude-2', 'Claude 2'),
        'Claude 2.1': ('claude-2.1', 'Claude 2.1'),
        'Claude 3 Opus': ('claude-3', 'Claude 3 Opus'),
        'Claude 3 Sonnet': ('claude-3-sonnet', 'Claude 3 Sonnet'),
        'Claude 3 Haiku': ('claude-3-haiku', 'Claude 3 Haiku'),
        'Claude 3.5 Sonnet': ('claude-3-5-sonnet-20240620', 'Claude 3.5 Sonnet'),

        # Add more LLM options as needed
    }

    # Model settings: max input/output tokens
    llm_model_settings = {
        'gpt-3.5-turbo': {'max_input_tokens': 2048, 'max_output_tokens': 2048},
        'gpt-3.5-turbo-16k-0613': {'max_input_tokens': 2048, 'max_output_tokens': 2048},
        'gpt-4-0613': {'max_input_tokens': 4096, 'max_output_tokens': 4096},
        'gpt-4': {'max_input_tokens': 4096, 'max_output_tokens': 4096},
        'gpt-4-turbo-preview': {'max_input_tokens': 123904, 'max_output_tokens': 4096},
        'gpt-4o': {'max_input_tokens': 123904, 'max_output_tokens': 4096},
        'gpt-3.5-instruct': {'max_input_tokens': 4096, 'max_output_tokens': 4096},
        'gpt-3.5-turbo-0125': {'max_input_tokens': 12288, 'max_output_tokens': 4096},
        'claude-2': {'max_input_tokens': 95904, 'max_output_tokens': 4096},
        'claude-2.1': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
        'claude-3-opus': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
        'claude-3-sonnet': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
        'claude-3-haiku': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
        'claude-3-5-sonnet-20240620': {'max_input_tokens': 195906, 'max_output_tokens': 8192},
        'auto': {'max_input_tokens': None, 'max_output_tokens': None},  # Auto settings can be decided at runtime
    }

    # Default LLM model for each module
    default_llm_for_module = {
        StoryTextModel: llm_options['GPT-4o'][0],
        SceneTextModel: llm_options['GPT-4o'][0],
        BeatSheetModel: llm_options['GPT-4o'][0],
        ScriptTextModel: llm_options['GPT-4o'][0],
        SuggestedStoryTitleModel: llm_options['GPT-4o'][0],
        MagicNoteCriticModel: llm_options['GPT-4o'][0],
        CharacterProfileModel: llm_options['GPT-4o'][0],
        LocationProfileModel: llm_options['GPT-4o'][0],
    }
