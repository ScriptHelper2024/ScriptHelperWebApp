from main.modules.Admin.AdminService import AdminService
from main.modules.Admin.PlatformSettingModel import PlatformSettingModel

# Placeholder platform setting keys with default values
PLATFORM_SETTINGS = {
    "prompts.generateStoryFromSeed": {"system_role": None, "user_prompt": None},
    "prompts.generateStoryWithNotes": {"system_role": None, "user_prompt": None},
    "prompts.generateStoryWithNotes.selective": {"system_role": None, "user_prompt": None},
    "prompts.generateSceneFromSeed": {"system_role": None, "user_prompt": None},
    "prompts.generateSceneWithNotes": {"system_role": None, "user_prompt": None},
    "prompts.generateSceneWithNotes.selective": {"system_role": None, "user_prompt": None},
    "prompts.generateMakeScenes": {"system_role": None, "user_prompt": None},
    "prompts.generateBeatSheetFromScene": {"system_role": None, "user_prompt": None},
    "prompts.generateBeatSheetWithNotes": {"system_role": None, "user_prompt": None},
    "prompts.generateBeatSheetWithNotes.selective": {"system_role": None, "user_prompt": None},
    "prompts.generateScriptTextFromScene": {"system_role": None, "user_prompt": None},
    "prompts.generateScriptTextWithNotes": {"system_role": None, "user_prompt": None},
    "prompts.generateScriptTextWithNotes.selective": {"system_role": None, "user_prompt": None},
    "prompts.generateTitleSuggestion": {"system_role": None, "user_prompt": None},
    "prompts.generateCharacterFromSeed": {"system_role": None, "user_prompt": None},
    "prompts.generateCharacterWithNotes": {"system_role": None, "user_prompt": None},
    "prompts.generateCharacterWithNotes.selective": {"system_role": None, "user_prompt": None},
    "prompts.generateLocationFromSeed": {"system_role": None, "user_prompt": None},
    "prompts.generateLocationWithNotes": {"system_role": None, "user_prompt": None},
    "prompts.generateLocationWithNotes.selective": {"system_role": None, "user_prompt": None},
    "prompts.generateExpansiveNotes.story_text": {"system_role": None, "user_prompt": None},
    "prompts.generateExpansiveNotes.scene_text": {"system_role": None, "user_prompt": None},
    "prompts.generateExpansiveNotes.beat_sheet": {"system_role": None, "user_prompt": None},
    "prompts.generateExpansiveNotes.script_text": {"system_role": None, "user_prompt": None},
    "prompts.generateExpansiveNotes.character_profile": {"system_role": None, "user_prompt": None},
    "prompts.generateExpansiveNotes.location_profile": {"system_role": None, "user_prompt": None},
    "prompts.generateMagicNotes.story_text": {"system_role": None, "user_prompt": None},
    "prompts.generateMagicNotes.scene_text": {"system_role": None, "user_prompt": None},
    "prompts.generateMagicNotes.beat_sheet": {"system_role": None, "user_prompt": None},
    "prompts.generateMagicNotes.script_text": {"system_role": None, "user_prompt": None},
    "prompts.generateMagicNotes.character_profile": {"system_role": None, "user_prompt": None},
    "prompts.generateMagicNotes.location_profile": {"system_role": None, "user_prompt": None},
}


def init_platform_settings():
    # Loop through each platform setting key defined in PLATFORM_SETTINGS
    for key, default_value in PLATFORM_SETTINGS.items():
        try:
            # Attempt to fetch the existing setting
            existing_setting = AdminService.get_platform_setting(key)
            # If the setting exists, consider updating its value here if necessary
            # AdminService.update_platform_setting(key, default_value) # Optional: Uncomment if updates are desired
        except ValueError:
            # If the setting does not exist, register it with its default value
            AdminService.register_platform_setting(key, default_value)

    # Clean up settings that are no longer defined in PLATFORM_SETTINGS
    try:
        all_settings = PlatformSettingModel.objects.all()
        for setting in all_settings:
            if setting.key not in PLATFORM_SETTINGS:
                # The setting is no longer defined, unregister it
                AdminService.unregister_platform_setting(setting.key)
    except ValueError as e:
        # Log the error or handle it as per your application's logging strategy
        print(f"Error during cleanup of platform settings: {e}")
