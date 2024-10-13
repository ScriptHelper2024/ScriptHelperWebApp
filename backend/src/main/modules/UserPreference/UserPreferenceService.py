# Import required modules
from mongoengine.queryset.visitor import Q
from .UserPreferenceModel import UserPreferenceModel
from ..User.UserModel import UserModel
from datetime import datetime
from main.libraries.Event import Event
from main.libraries.Observable import Observable
import copy
from main.config.settings import settings
from main.libraries.Cache import Cache

# Initialize Observable object for user events
user_preference_events = Observable()

# UserPreferenceService class that provides user preference management functions with static methods
class UserPreferenceService:
    """
    UserPreferenceService class provides methods for user preference retrieval and update.
    """

    @staticmethod
    def get_default_llm_options():
        options = settings.llm_options
        value_labels = {}
        for key in options: value_labels[options[key][0]] = options[key][1]
        return value_labels

    @staticmethod
    def register_user_preference(user_id):
        """
        Registers a new user preference object with the provided user.
        """

        default_llm = 'auto'

        user_preference = UserPreferenceModel(default_llm=default_llm, user=user_id)
        user_preference.save()

        UserPreferenceService.clear_user_preference_cache(user_id)

        # Return the user preferences
        return user_preference

    # Find a user preference by user id
    @staticmethod
    def find_by_user_id(user_id: str):
        """
        Finds a user preferences object with the given user_id.
        """

        # get user preferences by user
        user_preference = UserPreferenceModel.objects(user=user_id).first()

        if not user_preference:
            user_preference = UserPreferenceService.register_user_preference(user_id)

        return user_preference

    # Update a user's preferences
    @staticmethod
    def update_user_preference(id: str, default_llm: str = None):
        """
        Updates the user preference with the given user id.
        Raises an error if the user is not found
        """
        # user = UserModel.objects(id=user_id).first()  # get the user by id
        user_preference = UserPreferenceModel.objects(user=id).first()

        if user_preference is None:
            user_preference = UserPreferenceService.register_user_preference(id)

        # Update default_llm if provided
        if default_llm is not None:
            # check if default_llm value is an allowed value
            if default_llm not in UserPreferenceService.get_default_llm_options():
                raise ValueError('Invalid value for Default LLM')

            user_preference.default_llm = default_llm  # set new default_llm

        user_preference.save()

        UserPreferenceService.clear_user_preference_cache(id)

        return user_preference

    @staticmethod
    def clear_user_preference_cache(user_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'user_preference_id:{user_id}')
        tags_to_clear.append(f'my_preference_{user_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
