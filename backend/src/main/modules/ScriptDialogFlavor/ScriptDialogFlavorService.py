# Import required modules
from mongoengine.queryset.visitor import Q
from .ScriptDialogFlavorModel import ScriptDialogFlavorModel
from datetime import datetime
from main.libraries.Event import Event
from main.libraries.Observable import Observable
import copy
from bson import ObjectId
from ..User.UserModel import UserModel
from main.config.settings import settings
from main.libraries.Cache import Cache

# ScriptDialogFlavorService class that provides script dialog flavors management functions with static methods
class ScriptDialogFlavorService:
    """
    ScriptDialogFlavorService class provides methods for script dialog flavors registration, search, deletion, and update.
    It also triggers events for actions: script dialog flavor registration, deletion, and update.
    """
    # Initialize Observable object for script dialog flavor events
    script_dialog_flavor_events = Observable()

    # Register a new script dialog flavor
    @staticmethod
    def register_script_dialog_flavor(name: str, prompt_text: str, archived: bool, is_global: bool, user_context=None):
        """
        Registers a new script dialog flavor with the provided name and prompt text.
        After creating the script dialog flavor, notifies 'script_dialog_flavor_registered' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        # Create a new script dialog flavor
        script_dialog_flavor = ScriptDialogFlavorModel(name=name, prompt_text=prompt_text, user=user_id, archived=archived)
        if is_admin:
            script_dialog_flavor.is_global = is_global
        script_dialog_flavor.save()  # save the script dialog flavor to database

        #refresh data
        script_dialog_flavor = ScriptDialogFlavorModel.objects(id=script_dialog_flavor.id).first()

        # Trigger 'script_dialog_flavor_registered' event and pass the script dialog flavor id
        ScriptDialogFlavorService.script_dialog_flavor_events.notify(Event('script_dialog_flavor_registered', str(script_dialog_flavor.id)))
        ScriptDialogFlavorService.clear_script_dialog_flavor_cache(script_dialog_flavor.id)

        # Return the script dialog flavor id
        return str(script_dialog_flavor.id)

    # Find an script dialog flavor by id
    @staticmethod
    def find_by_id(script_dialog_flavor_id: str, include_archived: bool, include_global: bool, user_context=None):
        """
        Finds an script dialog flavor with the given id.
        Raises an error if the script dialog flavor not found.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        script_dialog_flavor = ScriptDialogFlavorModel.objects(id=script_dialog_flavor_id)  # get the script dialog flavor by id

        if not is_admin:
            script_dialog_flavor = script_dialog_flavor.filter(Q(user=user_id) | (Q(is_global=True) & Q(archived=False)))

        if not include_global:
            script_dialog_flavor = script_dialog_flavor.filter(is_global=False)

        if not include_archived:
            script_dialog_flavor = script_dialog_flavor.filter(archived=False)

        script_dialog_flavor = script_dialog_flavor.first()

        if not script_dialog_flavor:
            raise ValueError('Script Dialog Flavor not found')  # if not found, raise an exception

        return script_dialog_flavor  # return the script dialog flavor object

    @staticmethod
    def calculate_statistics():

        ScriptDialogFlavorModel.objects()

        total_count = ScriptDialogFlavorModel.objects().count()
        global_query = ScriptDialogFlavorModel.objects().filter(is_global=True)
        archived_query = ScriptDialogFlavorModel.objects().filter(archived=True)

        total_global_count = global_query.count()
        total_user_created_count = total_count - total_global_count

        total_archived_count = archived_query.count()
        total_non_archived_count = total_count - total_archived_count

        statistics = {
            'total_count': total_count,
            'total_user_created_count': total_user_created_count,
            'total_global_count': total_global_count,
            'total_archived_count': total_archived_count,
            'total_non_archived_count': total_non_archived_count
        }
        return statistics


    # Find all script dialog flavors with pagination and optional global filter
    @staticmethod
    def find_all(name_search_term = '', email_search_term = '', id_search_term = '', include_archived = False, global_only = False, page=1, limit=None, user_context=None):
        """
        Returns a list of script dialog flavors.
        Script Dialog Flavor are ordered by id in descending order.
        Pagination is applied with given page and limit parameters.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        if not limit:
            limit = settings.record_limit

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        skip = (page - 1) * limit  # calculate the number of script dialog flavors to skip for pagination
        query = ScriptDialogFlavorModel.objects()  # create a query to fetch script dialog flavors from the database

        if not is_admin:
            query = query.filter(Q(user=user_id) | (Q(is_global=True) & Q(archived=False)))

        if global_only:
            query = query.filter(is_global=True)

        if not include_archived:
            query = query.filter(archived=False)

        if name_search_term != '':
            query = query.filter(name__icontains=name_search_term)

        if email_search_term != '':
            users = UserModel.objects().filter(Q(email__icontains=email_search_term))
            user_ids = [user.id for user in users]
            query = query.filter(user__in=user_ids)

        if id_search_term != '':
            try:
                user_id = ObjectId(id_search_term)
                users = UserModel.objects().filter(Q(id=user_id))
                user_ids = [user.id for user in users]
                query = query.filter(user__in=user_ids)
            except:
                query = query.filter(user=None)
                pass

        total_count = query.count()
        pages = 1 if limit == 0 else (total_count + limit - 1) // limit

        # Fetch script dialog flavors from the database with applied filters and pagination
        script_dialog_flavors = query.order_by('-id').skip(skip).limit(limit)

        statistics = ScriptDialogFlavorService.calculate_statistics()

        return script_dialog_flavors, pages, statistics  # return the script dialog flavors list and pages

    # Delete an script dialog flavor
    @staticmethod
    def delete_script_dialog_flavor(script_dialog_flavor_id, user_context=None):
        """
        Deletes an script dialog flavor with the given id.
        Raises an error if the script dialog flavor is not found.
        After deleting the script dialog flavor, notifies 'script_dialog_flavor_deleted' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        script_dialog_flavor = ScriptDialogFlavorModel.objects(id=script_dialog_flavor_id)  # get the script dialog flavor by id

        if not is_admin:
            script_dialog_flavor = script_dialog_flavor.filter(user=user_id)

        script_dialog_flavor = script_dialog_flavor.first()

        if script_dialog_flavor is None:
            raise ValueError('Script Dialog Flavor not found')  # if not found, raise an exception

        script_dialog_flavor.delete()  # delete the script dialog flavor from the database

        # Trigger 'script_dialog_flavor_deleted' event and pass the script dialog flavor id
        ScriptDialogFlavorService.script_dialog_flavor_events.notify(Event('script_dialog_flavor_deleted', script_dialog_flavor_id))
        ScriptDialogFlavorService.clear_script_dialog_flavor_cache(script_dialog_flavor_id)

        return script_dialog_flavor_id  # return the script dialog flavor id

    # Update an script dialog flavor
    @staticmethod
    def update_script_dialog_flavor(id: str, name: str, prompt_text: str, archived: bool, is_global: bool, user_context=None):
        """
        Updates the script dialog flavor with the given id.
        Raises an error if the script dialog flavor is not found.
        Only updates provided fields (name and/or prompt text).
        After updating the script dialog flavor, notifies 'script_dialog_flavor_updated' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        script_dialog_flavor = ScriptDialogFlavorModel.objects(id=id)  # get the script dialog flavor by id

        if not is_admin:
            script_dialog_flavor = script_dialog_flavor.filter(user=user_id)

        script_dialog_flavor = script_dialog_flavor.first()

        if script_dialog_flavor is None:
            raise ValueError('Script Dialog Flavor not found')  # if not found, raise an exception

        # Create a copy of the original script dialog flavor data before making any changes
        original_script_dialog_flavor = copy.deepcopy(script_dialog_flavor)

        if archived is not None:
            script_dialog_flavor.archived = archived

        if is_admin and is_global is not None:
            script_dialog_flavor.is_global = is_global

        # Update name if provided
        if name is not None:
            script_dialog_flavor.name = name  # set new name

        # Update prompt text if provided
        if prompt_text is not None:
            script_dialog_flavor.prompt_text = prompt_text  # set new prompt text

        script_dialog_flavor.modified_at = datetime.utcnow()  # update the modified timestamp
        script_dialog_flavor.save()  # save the changes to the database

        #refresh data
        script_dialog_flavor = ScriptDialogFlavorModel.objects(id=script_dialog_flavor.id).first()        

        # Trigger 'script_dialog_flavor_updated' event and pass the original and updated script dialog flavor objects
        ScriptDialogFlavorService.script_dialog_flavor_events.notify(Event('script_dialog_flavor_updated', {'original': original_script_dialog_flavor, 'updated': script_dialog_flavor}))
        ScriptDialogFlavorService.clear_script_dialog_flavor_cache(script_dialog_flavor.id)

        return script_dialog_flavor  # return the updated script dialog flavor object

    @staticmethod
    def clear_script_dialog_flavor_cache(script_dialog_flavor_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append('script_dialog_flavors_') #clear all "list all" query responses
        tags_to_clear.append(f'script_dialog_flavor_id:{script_dialog_flavor_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
