# Import required modules
from bson import ObjectId
from mongoengine.queryset.visitor import Q
from .AuthorStyleModel import AuthorStyleModel
from ..User.UserModel import UserModel
from datetime import datetime
from main.libraries.Event import Event
from main.libraries.Observable import Observable
import copy
from main.config.settings import settings
from main.libraries.Cache import Cache

# AuthorStyleService class that provides author styles management functions with static methods
class AuthorStyleService:
    """
    AuthorStyleService class provides methods for author styles registration, search, deletion, and update.
    It also triggers events for actions: author style registration, deletion, and update.
    """
    # Initialize Observable object for author style events
    author_style_events = Observable()

    # Register a new author style
    @staticmethod
    def register_author_style(name: str, prompt_text: str, archived: bool, is_global: bool, user_context=None):
        """
        Registers a new author style with the provided name and prompt text.
        After creating the author style, notifies 'author_style_registered' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        # Create a new author style
        author_style = AuthorStyleModel(name=name, prompt_text=prompt_text, user=user_id, archived=archived)
        if is_admin:
            author_style.is_global = is_global
        author_style.save()  # save the author style to database

        #refresh data
        author_style = AuthorStyleModel.objects(id=author_style.id).first()

        # Trigger 'author_style_registered' event and pass the author style id
        AuthorStyleService.author_style_events.notify(Event('author_style_registered', str(author_style.id)))
        AuthorStyleService.clear_author_style_cache(author_style.id)

        # Return the author style id
        return str(author_style.id)

    # Find an author style by id
    @staticmethod
    def find_by_id(author_style_id: str, include_archived: bool, global_only: bool, user_context=None):
        """
        Finds an author style with the given id.
        Raises an error if the author style not found.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        author_style = AuthorStyleModel.objects(id=author_style_id)  # get the author style by id

        if not is_admin:
            author_style = author_style.filter(Q(user=user_id) | (Q(is_global=True) & Q(archived=False)))

        if global_only:
            author_style = author_style.filter(is_global=True)

        if not include_archived:
            author_style = author_style.filter(archived=False)

        author_style = author_style.first()

        if not author_style:
            raise ValueError('Author Style not found')  # if not found, raise an exception

        return author_style  # return the author style object

    @staticmethod
    def calculate_statistics():

        AuthorStyleModel.objects()

        total_count = AuthorStyleModel.objects().count()
        global_query = AuthorStyleModel.objects().filter(is_global=True)
        archived_query = AuthorStyleModel.objects().filter(archived=True)

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

    # Find all author styles with pagination and optional global filter
    @staticmethod
    def find_all(name_search_term = '', email_search_term = '', id_search_term = '', include_archived = False, global_only = False, page=1, limit=None, user_context=None):
        """
        Returns a list of author styles.
        Author Style are ordered by id in descending order.
        Pagination is applied with given page and limit parameters.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        if not limit:
            limit = settings.record_limit

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        skip = (page - 1) * limit  # calculate the number of author styles to skip for pagination
        query = AuthorStyleModel.objects()  # create a query to fetch author styles from the database

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

        # Fetch author styles from the database with applied filters and pagination
        author_styles = query.order_by('-id').skip(skip).limit(limit)

        statistics = AuthorStyleService.calculate_statistics()

        return author_styles, pages, statistics

    # Delete an author style
    @staticmethod
    def delete_author_style(author_style_id, user_context=None):
        """
        Deletes an author style with the given id.
        Raises an error if the author style is not found.
        After deleting the author style, notifies 'author_style_deleted' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        author_style = AuthorStyleModel.objects(id=author_style_id)  # get the author style by id

        if not is_admin:
            author_style = author_style.filter(user=user_id)

        author_style = author_style.first()

        if author_style is None:
            raise ValueError('Author Style not found')  # if not found, raise an exception

        author_style.delete()  # delete the author style from the database

        # Trigger 'author_style_deleted' event and pass the author style id
        AuthorStyleService.author_style_events.notify(Event('author_style_deleted', author_style_id))
        AuthorStyleService.clear_author_style_cache(author_style_id)

        return author_style_id  # return the author style id

    # Update an author style
    @staticmethod
    def update_author_style(id: str, name: str, prompt_text: str, archived: bool, is_global: bool, user_context=None):
        """
        Updates the author style with the given id.
        Raises an error if the author style is not found.
        Only updates provided fields (name and/or prompt text).
        After updating the author style, notifies 'author_style_updated' event.
        """
        # Check if a user context exists
        if not user_context:
            raise ValueError('No logged in user')

        user_id = user_context.id
        is_admin = user_context.admin_level > 0  # check if admin

        author_style = AuthorStyleModel.objects(id=id)  # get the author style by id

        if not is_admin:
            author_style = author_style.filter(user=user_id)

        author_style = author_style.first()

        if author_style is None:
            raise ValueError('Author Style not found')  # if not found, raise an exception

        # Create a copy of the original author style data before making any changes
        original_author_style = copy.deepcopy(author_style)

        if archived is not None:
            author_style.archived = archived

        if is_admin and is_global is not None:
            author_style.is_global = is_global

        # Update name if provided
        if name is not None:
            author_style.name = name  # set new name

        # Update prompt text if provided
        if prompt_text is not None:
            author_style.prompt_text = prompt_text  # set new prompt text

        author_style.modified_at = datetime.utcnow()  # update the modified timestamp
        author_style.save()  # save the changes to the database

        #refresh data
        author_style = AuthorStyleModel.objects(id=author_style.id).first()

        # Trigger 'author_style_updated' event and pass the original and updated author style objects
        AuthorStyleService.author_style_events.notify(Event('author_style_updated', {'original': original_author_style, 'updated': author_style}))
        AuthorStyleService.clear_author_style_cache(author_style.id)

        return author_style  # return the updated author style object

    @staticmethod
    def clear_author_style_cache(author_style_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append('author_styles_') #clear all "list all" query responses
        tags_to_clear.append(f'author_style_id:{author_style_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
