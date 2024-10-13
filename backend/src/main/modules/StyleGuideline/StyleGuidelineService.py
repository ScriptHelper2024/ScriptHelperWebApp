# Import required modules
from mongoengine.queryset.visitor import Q
from .StyleGuidelineModel import StyleGuidelineModel
from datetime import datetime
from main.libraries.Event import Event
from main.libraries.Observable import Observable
import copy
from bson import ObjectId
from ..User.UserModel import UserModel
from main.config.settings import settings
from main.libraries.Cache import Cache

# StyleGuidelineService class that provides style guidelines management functions with static methods
class StyleGuidelineService:
    """
    StyleGuidelineService class provides methods for style guidelines registration, search, deletion, and update.
    It also triggers events for actions: style guideline registration, deletion, and update.
    """
    # Initialize Observable object for style guideline events
    style_guideline_events = Observable()

    # Register a new style guideline
    @staticmethod
    def register_style_guideline(name: str, prompt_text: str, archived: bool, is_global: bool, user_context=None):
        """
        Registers a new style guideline with the provided name and prompt text.
        After creating the style guideline, notifies 'style_guideline_registered' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        # Create a new style guideline
        style_guideline = StyleGuidelineModel(name=name, prompt_text=prompt_text, user=user_id, archived=archived)
        if is_admin:
            style_guideline.is_global = is_global
        style_guideline.save()  # save the style guideline to database

        #refresh data
        style_guideline = StyleGuidelineModel.objects(id=style_guideline.id).first()

        # Trigger 'style_guideline_registered' event and pass the style guideline id
        StyleGuidelineService.style_guideline_events.notify(Event('style_guideline_registered', str(style_guideline.id)))
        StyleGuidelineService.clear_style_guideline_cache(style_guideline.id)

        # Return the style guideline id
        return str(style_guideline.id)

    # Find an style guideline by id
    @staticmethod
    def find_by_id(style_guideline_id: str, include_archived: bool, include_global: bool, user_context=None):
        """
        Finds an style guideline with the given id.
        Raises an error if the style guideline not found.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        style_guideline = StyleGuidelineModel.objects(id=style_guideline_id)  # get the style guideline by id

        if not is_admin:
            style_guideline = style_guideline.filter(Q(user=user_id) | (Q(is_global=True) & Q(archived=False)))

        if not include_global:
            style_guideline = style_guideline.filter(is_global=False)

        if not include_archived:
            style_guideline = style_guideline.filter(archived=False)

        style_guideline = style_guideline.first()

        if not style_guideline:
            raise ValueError('Style Guideline not found')  # if not found, raise an exception

        return style_guideline  # return the style guideline object

    @staticmethod
    def calculate_statistics():

        StyleGuidelineModel.objects()

        total_count = StyleGuidelineModel.objects().count()
        global_query = StyleGuidelineModel.objects().filter(is_global=True)
        archived_query = StyleGuidelineModel.objects().filter(archived=True)

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


    # Find all style guidelines with pagination and optional global filter
    @staticmethod
    def find_all(name_search_term = '', email_search_term = '', id_search_term = '', include_archived = False, global_only = False, page=1, limit=None, user_context=None):
        """
        Returns a list of style guidelines.
        Style Guideline are ordered by id in descending order.
        Pagination is applied with given page and limit parameters.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        if not limit:
            limit = settings.record_limit

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        skip = (page - 1) * limit  # calculate the number of style guidelines to skip for pagination
        query = StyleGuidelineModel.objects()  # create a query to fetch style guidelines from the database

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

        # Fetch style guidelines from the database with applied filters and pagination
        style_guidelines = query.order_by('-id').skip(skip).limit(limit)

        statistics = StyleGuidelineService.calculate_statistics()

        return style_guidelines, pages, statistics  # return the style guidelines list and pages

    # Delete an style guideline
    @staticmethod
    def delete_style_guideline(style_guideline_id, user_context=None):
        """
        Deletes an style guideline with the given id.
        Raises an error if the style guideline is not found.
        After deleting the style guideline, notifies 'style_guideline_deleted' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        style_guideline = StyleGuidelineModel.objects(id=style_guideline_id)  # get the style guideline by id

        if not is_admin:
            style_guideline = style_guideline.filter(user=user_id)

        style_guideline = style_guideline.first()

        if style_guideline is None:
            raise ValueError('Style Guideline not found')  # if not found, raise an exception

        style_guideline.delete()  # delete the style guideline from the database

        # Trigger 'style_guideline_deleted' event and pass the style guideline id
        StyleGuidelineService.style_guideline_events.notify(Event('style_guideline_deleted', style_guideline_id))
        StyleGuidelineService.clear_style_guideline_cache(style_guideline_id)

        return style_guideline_id  # return the style guideline id

    # Update an style guideline
    @staticmethod
    def update_style_guideline(id: str, name: str, prompt_text: str, archived: bool, is_global: bool, user_context=None):
        """
        Updates the style guideline with the given id.
        Raises an error if the style guideline is not found.
        Only updates provided fields (name and/or prompt text).
        After updating the style guideline, notifies 'style_guideline_updated' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        style_guideline = StyleGuidelineModel.objects(id=id)  # get the style guideline by id

        if not is_admin:
            style_guideline = style_guideline.filter(user=user_id)

        style_guideline = style_guideline.first()

        if style_guideline is None:
            raise ValueError('Style Guideline not found')  # if not found, raise an exception

        # Create a copy of the original style guideline data before making any changes
        original_style_guideline = copy.deepcopy(style_guideline)

        if archived is not None:
            style_guideline.archived = archived

        if is_admin and is_global is not None:
            style_guideline.is_global = is_global

        # Update name if provided
        if name is not None:
            style_guideline.name = name  # set new name

        # Update prompt text if provided
        if prompt_text is not None:
            style_guideline.prompt_text = prompt_text  # set new prompt text

        style_guideline.modified_at = datetime.utcnow()  # update the modified timestamp
        style_guideline.save()  # save the changes to the database

        #refresh data
        style_guideline = StyleGuidelineModel.objects(id=style_guideline.id).first()        

        # Trigger 'style_guideline_updated' event and pass the original and updated style guideline objects
        StyleGuidelineService.style_guideline_events.notify(Event('style_guideline_updated', {'original': original_style_guideline, 'updated': style_guideline}))
        StyleGuidelineService.clear_style_guideline_cache(style_guideline.id)

        return style_guideline  # return the updated style guideline object

    @staticmethod
    def clear_style_guideline_cache(style_guideline_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append('style_guidelines_') #clear all "list all" query responses
        tags_to_clear.append(f'style_guideline_id:{style_guideline_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
