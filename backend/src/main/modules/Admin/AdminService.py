# src/main/modules/Admin/AdminService.py
from datetime import datetime
from mongoengine.queryset.visitor import Q
from inflection import underscore

# Importing model classes
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.CharacterProfile.CharacterProfileModel import CharacterProfileModel
from main.modules.LocationProfile.LocationProfileModel import LocationProfileModel
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleModel import SuggestedStoryTitleModel

from .PlatformSettingModel import PlatformSettingModel

class AdminService:
    @staticmethod
    def get_platform_statistics(start_date=None, end_date=None):
        # Prepare date filters
        date_filter = []
        if start_date:
            date_filter.append(Q(created_at__gte=start_date))
        if end_date:
            date_filter.append(Q(created_at__lte=end_date))

        models = [
            ProjectModel,
            StoryTextModel,
            SceneTextModel,
            BeatSheetModel,
            ScriptTextModel,
            CharacterProfileModel,
            LocationProfileModel,
            SuggestedStoryTitleModel
        ]

        statistics = {}

        for model in models:
            model_name = model.__name__
            # Truncate "Model" from the model class name to get the module name
            module_name = model_name.removesuffix("Model")
            snake_case_module_name = underscore(module_name)  # Convert to snake_case
            if date_filter:
                count = model.objects.filter(*date_filter).count()
            else:
                count = model.objects.count()
            statistics[snake_case_module_name] = count

        return statistics

    @staticmethod
    def register_platform_setting(key, value):
        """Registers a new platform setting with a unique key."""
        if PlatformSettingModel.objects(key=key).count() > 0:
            raise ValueError("A platform setting with this key already exists.")
        new_setting = PlatformSettingModel(key=key, value=value).save()
        return new_setting


    @staticmethod
    def get_platform_setting(key):
        """Retrieves a platform setting by its key."""
        setting = PlatformSettingModel.objects(key=key).first()
        if setting is None:
            raise ValueError("Platform setting not found.")
        return setting

    @staticmethod
    def update_platform_setting(key, new_value):
        """Updates the value of an existing platform setting."""
        setting = PlatformSettingModel.objects(key=key).first()
        if setting is None:
            raise ValueError("Platform setting not found.")
        setting.update(value=new_value, modified_at=datetime.utcnow())
        #clear prompt template cached assignments
        from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
        PromptTemplateService.clear_prompt_template_cache()

    @staticmethod
    def unregister_platform_setting(key):
        """Permanently deletes a platform setting from the system."""
        setting = PlatformSettingModel.objects(key=key)
        if setting.count() > 0:
            setting.delete()

    @staticmethod
    def list_platform_settings():
        """Lists all platform settings."""
        settings = PlatformSettingModel.objects.all()
        return settings  # Return the list of PlatformSettingModel objects directly
