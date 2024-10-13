# Import required modules
from .UserModel import UserModel
from validate_email_address import validate_email
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.modules.Auth.AuthService import AuthService
import copy
from ..UserPreference.UserPreferenceService import UserPreferenceService
from main.config.settings import settings
from main.libraries.Cache import Cache

# UserService class that provides user management functions with static methods
class UserService:
    """
    UserService class provides methods for user registration, search, deletion, and update.
    It also triggers events for actions: user registration, deletion, and update.
    """
    # Initialize Observable object for user events
    user_events = Observable()

    @staticmethod
    def register_user(email: str, first_name=None, last_name=None, password=None, user_context=None, oauth_provider=None, oauth_token=None):
        """
        Registers a new user with the provided email and optional password.
        If the registration is not via an OAuth provider, a password is required and must meet minimum length criteria.
        """

        # Raise error if a user is already logged in
        if user_context:
            raise ValueError('A user is already logged in')

        # Validate the email address format
        if not validate_email(email):
            raise ValueError('Invalid Email')

        # Check if the email is already in use
        if UserModel.objects(email=email).first():
            raise ValueError('Email Already in Use')

        # If not registering via OAuth, enforce password requirements
        if not oauth_provider:
            if not password or len(password) < 6:
                raise ValueError('Password must be at least 6 characters long')

            hashed_password = generate_password_hash(password)
        else:
            hashed_password = None  # No password for OAuth registrations

        # Prepare the user metadata for OAuth registrations
        metadata = {}
        if oauth_provider:
            metadata = {
                f'oauth_{oauth_provider}': {'oauth_token': oauth_token},
                'linked_oauth_provider': oauth_provider
            }

        # Create a new user instance with the provided details
        user = UserModel(email=email, first_name=first_name, last_name=last_name, password=hashed_password, metadata=metadata)
        user.save()  # Save the user to the database

        #refresh data
        user = UserModel.objects(id=user.id).first()

        # Notify that a new user has been registered
        UserService.user_events.notify(Event('user_registered', str(user.id)))

        # Authenticate the user without a password if this is an OAuth registration
        access_token = AuthService.authenticate_user(email, password, oauth_mode=bool(oauth_provider))
        UserService.clear_user_cache(user.id, user.email)

        # Return the user ID and access token
        return str(user.id), access_token

    # Find a user by id
    @staticmethod
    def find_by_id(user_id):
        """
        Finds a user with the given id.
        Raises an error if the user not found.
        """
        user = UserModel.objects(id=user_id).first()  # get the user by id
        if not user:
            raise ValueError('User not found')  # if not found, raise an exception
        return user  # return the user object

    # Find a user by email
    @staticmethod
    def find_by_email(email):
        """
        Finds a user with the given email.
        Raises an error if the user is not found.
        """
        user = UserModel.objects(email=email).first()  # get the user by email
        if not user:
            raise ValueError('User not found')  # if not found, raise an exception
        return user  # return the user object

    # Find all users with pagination and optional email filter
    @staticmethod
    def find_all(page=1, limit=None, email=None, from_date=None, to_date=None):
        """
        Returns a tuple of users list and the total page count.
        Users are ordered by id in descending order.
        Pagination is applied with given page and limit parameters.
        If email filter is provided, it applies the filter to the user list.
        """
        if not limit:
            limit = settings.record_limit

        skip = (page - 1) * limit  # calculate the number of users to skip for pagination
        query = UserModel.objects()  # create a query to fetch users from the database

        if from_date is not None:
            query = query.filter(created_at__gte=from_date)

        if to_date is not None:
            query = query.filter(created_at__lte=(to_date + timedelta(days=1)))

        # Apply email filter if provided
        if email is not None:
            query = query.filter(email__icontains=email)

        # Calculate total page count
        total_count = query.count()
        pages = (total_count + limit - 1) // limit

        verified_users_count = query.filter(email_verified__exact=1).count()
        statistics = {
		  'total_users_count': total_count,
		  'verified_users_count': verified_users_count,
		}

        # Fetch users from the database with applied filters and pagination
        users = query.order_by('-id').skip(skip).limit(limit)

        return users, pages, statistics  # return the user list and total page count

    # Delete a user
    @staticmethod
    def delete_user(user_id):
        """
        Deletes a user with the given id.
        Raises an error if the user is not found.
        After deleting the user, notifies 'user_deleted' event.
        """
        user = UserModel.objects(id=user_id).first()  # get the user by id
        if user is None:
            raise ValueError('User not found')  # if not found, raise an exception
        user_email = user.email

        user.delete()  # delete the user from the database

        # Trigger 'user_deleted' event and pass the user id
        UserService.user_events.notify(Event('user_deleted', user))
        UserService.clear_user_cache(user_id, user_email)

        return user_id  # return the user id

    # Update a user
    @staticmethod
    def update_user(id: str, email: str = None, password: str = None, first_name=None, last_name=None):
        """
        Updates the user with the given id.
        Raises an error if the user is not found or the new email is already in use.
        Only updates provided fields (email and/or password).
        After updating the user, notifies 'user_updated' event.
        """
        user = UserModel.objects(id=id).first()  # get the user by id
        if user is None:
            raise ValueError('User not found')  # if not found, raise an exception

        # Create a copy of the original user data before making any changes
        original_user = copy.deepcopy(user)

        # Update email if provided
        if email is not None:
            # Check if the new email is already in use by another user
            existing_user_with_email = UserModel.objects(email=email).first()
            if existing_user_with_email and str(existing_user_with_email.id) != id:
                raise ValueError('Email already in use')  # if in use by another user, raise an exception
            user.email = email  # set new emailw email

        # Update password if provided
        if password is not None:
            user.password = generate_password_hash(password)  # hash and set new password

        if first_name is not None:
            user.first_name = first_name

        if last_name is not None:
            user.last_name = last_name

        user.modified_at = datetime.utcnow()  # update the modified timestamp
        user.save()  # save the changes to the database

        #refresh data
        user = UserModel.objects(id=user.id).first()

        # Trigger 'user_updated' event and pass the original and updated user objects
        UserService.user_events.notify(Event('user_updated', {'original': original_user, 'updated': user}))
        UserService.clear_user_cache(user.id, user.email)

        return user  # return the updated user object

    @staticmethod
    def clear_user_cache(user_id, user_email=None):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'me_{user_id}')
        tags_to_clear.append(f'user_id:{user_id}')
        if user_email:
            tags_to_clear.append(f'user_email_email:{user_email}')
        tags_to_clear.append('users_')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
