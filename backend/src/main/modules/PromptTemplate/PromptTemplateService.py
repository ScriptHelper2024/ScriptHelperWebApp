# Import required modules
from mongoengine.queryset.visitor import Q
from .PromptTemplateModel import PromptTemplateModel
from datetime import datetime
from main.libraries.Event import Event
from main.libraries.Observable import Observable
import copy
from main.config.settings import settings
from main.libraries.Cache import Cache
from main.modules.Admin.AdminService import AdminService
from main.modules.Admin.PlatformSettingModel import PlatformSettingModel
from mongoengine import DoesNotExist
from main.libraries.functions import log_message

# PromptTemplateService class that provides prompt template management functions with static methods
class PromptTemplateService:
    """
    PromptTemplateService class provides methods for prompt template registration, search, deletion, and update.
    It also triggers events for actions: prompt template registration, deletion, and update.
    """
    # Initialize Observable object for prompt template events
    prompt_template_events = Observable()

    # Register a new prompt template
    @staticmethod
    def register_prompt_template(name: str, reference_key: str, prompt_text: str, user_context=None, update_existing=False):
        """
        Registers a new prompt template with the provided name, reference key, and prompt text.
        After creating the prompt template, notifies 'prompt_template_registered' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id

        # Check if update_existing flag is set and try to find an existing prompt template to update
        if update_existing:
            prompt_template = PromptTemplateModel.objects(reference_key=reference_key).first()
            if prompt_template:
                return PromptTemplateService.update_prompt_template(
                    prompt_template_id=str(prompt_template.id),
                    name=name,
                    reference_key=reference_key,
                    prompt_text=prompt_text,
                    user_context=user_context
                )


        # Create a new prompt template
        prompt_template = PromptTemplateModel(name=name, reference_key=reference_key, prompt_text=prompt_text, user=user_id)
        prompt_template.save()  # save the prompt template to database

        #refresh data
        prompt_template = PromptTemplateModel.objects(id=prompt_template.id).first()

        # Trigger 'prompt_template_registered' event and pass the prompt template id
        PromptTemplateService.prompt_template_events.notify(Event('prompt_template_registered', str(prompt_template.id)))
        PromptTemplateService.clear_prompt_template_cache(prompt_template.id)

        # Return the prompt_template
        return prompt_template

    # Find a prompt template by id
    @staticmethod
    def find_by_id(prompt_template_id: str, user_context=None):
        """
        Finds a prompt template with the given id.
        Raises an error if the prompt template not found.
        """

        prompt_template = PromptTemplateModel.objects(id=prompt_template_id).first()  # get prompt template by id

        if not prompt_template:
            raise ValueError('Prompt Template not found')  # if not found, raise an exception

        return prompt_template  # return the prompt template object

    # Find all prompt templates with pagination and optional global filter
    @staticmethod
    def find_all(page=1, limit=None, search_term='', user_context=None):
        """
        Returns a list of prompt templates.
        Prompt Templates are ordered by id in descending order.
        Pagination is applied with given page and limit parameters.
        """
        if not limit:
            limit = settings.record_limit

        skip = (page - 1) * limit  # calculate the number of prompt templates to skip for pagination
        query = PromptTemplateModel.objects()  # create a query to fetch prompt templates from the database

        # Apply searchTerm filter if provided
        if search_term:
            query = query.filter(Q(name__icontains=search_term) | Q(reference_key__icontains=search_term))

        # Fetch prompt templates from the database with applied filters and pagination
        prompt_templates = query.order_by('-id').skip(skip).limit(limit)

        total_count = query.count()
        pages = (total_count + limit - 1) // limit

        statistics = {
		  'total_prompt_templates_count': total_count,
		}

        return prompt_templates, pages, statistics # return the prompt templates list

    @staticmethod
    def delete_prompt_template(prompt_template_id, user_context=None):
        """
        Deletes a prompt template with the given id if it is not assigned to any platform setting.
        Raises an error if the prompt template is not found or is currently in use.
        After deleting the prompt template, notifies 'prompt_template_deleted' event.
        """
        prompt_template = PromptTemplateModel.objects(id=prompt_template_id).first()  # get the prompt template by id

        if prompt_template is None:
            raise ValueError('Prompt Template not found')  # if not found, raise an exception

        # Check for assigned platform settings
        assigned_settings = prompt_template.find_assigned_platform_settings()
        if assigned_settings:
            # If the prompt template is assigned to any setting, raise an exception
            raise ValueError('Cannot delete prompt template because it is assigned to platform settings: ' + ', '.join(assigned_settings))

        prompt_template.delete()  # delete the prompt template from the database

        # Trigger 'prompt_template_deleted' event and pass the prompt template id
        PromptTemplateService.prompt_template_events.notify(Event('prompt_template_deleted', prompt_template_id))
        PromptTemplateService.clear_prompt_template_cache(prompt_template_id)

        return prompt_template  # return the prompt template id

    # Update a prompt template
    @staticmethod
    def update_prompt_template(prompt_template_id: str, name: str, reference_key:str, prompt_text: str, user_context=None):
        """
        Updates the prompt template with the given id.
        Raises an error if the prompt template is not found.
        Only updates provided fields (name and/or prompt text).
        After updating the prompt template, notifies 'prompt_template_updated' event.
        """
        prompt_template = PromptTemplateModel.objects(id=prompt_template_id).first()  # get the prompt template by id

        if prompt_template is None:
            raise ValueError('Prompt Template not found')  # if not found, raise an exception

        # Create a copy of the original prompt template data before making any changes
        original_prompt_template = copy.deepcopy(prompt_template)

        # Update name if provided
        if name is not None:
            prompt_template.name = name  # set new name

        # Update reference key if provided
        if reference_key is not None:
            prompt_template.reference_key = reference_key  # set new name

        # Update prompt text if provided
        if prompt_text is not None:
            prompt_template.prompt_text = prompt_text  # set new prompt text

        prompt_template.modified_at = datetime.utcnow()  # update the modified timestamp
        prompt_template.save()  # save the changes to the database

        #refresh data
        prompt_template = PromptTemplateModel.objects(id=prompt_template.id).first()

        # Trigger 'prompt_style_updated' event and pass the original and updated prompt template objects
        PromptTemplateService.prompt_template_events.notify(Event('prompt_template_updated', {'original': original_prompt_template, 'updated': prompt_template}))
        PromptTemplateService.clear_prompt_template_cache(prompt_template.id)

        return prompt_template  # return the updated prompt template object

    @staticmethod
    def clear_prompt_template_cache(prompt_template_id=None):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append('prompt_templates_')
        if prompt_template_id:
            tags_to_clear.append(f'prompt_template_id:{prompt_template_id}')
        else:
            #clear all
            tags_to_clear.append(f'prompt_template_')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)

    @staticmethod
    def get_templates_for_setting(key):
        try:
            # Load the platform setting by the key
            setting = AdminService.get_platform_setting(key)

            # Extract the IDs for "system_role" and "user_prompt"
            system_role_id = setting.value.get('system_role') if setting.value else None
            user_prompt_id = setting.value.get('user_prompt') if setting.value else None

            # Initialize template variables
            system_role_template = None
            user_prompt_template = None

            # Load the PromptTemplateModel objects if IDs are found
            if system_role_id:
                try:
                    system_role_template = PromptTemplateModel.objects.get(id=system_role_id)
                except DoesNotExist:
                    log_message('error', f"System role prompt template with ID {system_role_id} not found.")

            if user_prompt_id:
                try:
                    user_prompt_template = PromptTemplateModel.objects.get(id=user_prompt_id)
                except DoesNotExist:
                    log_message('error', f"User prompt template with ID {user_prompt_id} not found.")

            return system_role_template, user_prompt_template

        except ValueError as e:
            # Handle the case where the setting is not found
            log_message('error', f"Error fetching platform setting: {e}")
            return None, None
