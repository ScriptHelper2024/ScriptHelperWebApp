"""
User Preference Schema

This file defines the User Preference GraphQL object type and all mutations associated with a User Preference.
"""
# Import the required modules
from graphene import ObjectType, String, Mutation, Field, ID, Boolean, Int, Argument, List, NonNull, JSONString
from .UserPreferenceService import UserPreferenceService
from graphql import GraphQLError
from main.libraries.decorators import admin_required, cache_response

# Define the UserPreference ObjectType
class UserPreference(ObjectType):
    """ UserPreference GraphQL Object """

    default_llm = String(required=False)

    @classmethod
    @admin_required(required_level=1)
    @cache_response('user_preference_', 'id')
    def resolve_by_user_id(cls, root, info, id):
        """ GraphQL Resolver to fetch a User Preferences by it's associated user """

        try:
            # Use UserPreferenceService to find user preferences by user ID
            user_preference = UserPreferenceService.find_by_user_id(id)
        except ValueError as e:
            raise GraphQLError(str(e))

        # Return PromptTemplate object
        return cls(**user_preference.to_dict())

    @classmethod
    @cache_response('my_preference_')
    def resolve_my_user_preference(cls, root, info):
        """ GraphQL Resolver to fetch the User Preferences for the currently authenticated User """

        # Retrieve the user from the context passed in by the JWT middleware
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        try:
            # Use UserPreferenceService to find user preferences by user ID
            user_preference = UserPreferenceService.find_by_user_id(user.id)
        except ValueError as e:
            raise GraphQLError(str(e))

        # Return UserPreference object
        return cls(**user_preference.to_dict())

# Define the UpdateUserPreference Mutation
class UpdateUserPreference(Mutation):
    """ UpdateUserPreference Mutation to update a User's preference settings """

    user_preference = Field(UserPreference)

    class Arguments:
        id = ID(required=True)
        default_llm = String()

    @admin_required(required_level=1)
    def mutate(self, info, id, default_llm):
        """ Resolve the mutation """

        try:
            # Update user preferences using UserPreferenceService
            user_preference = UserPreferenceService.update_user_preference(id, default_llm)
        except ValueError as e:
            # Raise GraphQLError if user preference not found
            raise GraphQLError(str(e))

        return UpdateUserPreference(user_preference=user_preference)

# Define the UpdateMyUserPreference Mutation
class UpdateMyUserPreference(Mutation):
    """ UpdateMyUserPreference Mutation to update the currently logged in User's preference settings """

    user_preference = Field(UserPreference)

    class Arguments:
        default_llm = String()

    def mutate(self, info, default_llm):
        """ Resolve the mutation """

        # Retrieve the currently logged in user from the context
        current_user = info.context.get('user')

        # Check if a user is logged in
        if not current_user:
            raise GraphQLError('Not authorized')

        try:
            # Update user preferences using UserPreferenceService
            user_preference = UserPreferenceService.update_user_preference(current_user.id, default_llm)
        except ValueError as e:
            raise GraphQLError(str(e))

        return UpdateMyUserPreference(user_preference=user_preference)

class DefaultLlmOptions(ObjectType):

    default_llm_options = Field(JSONString)

    @classmethod
    def resolve_default_llm_options(cls, root, info):
        """ GraphQL Resolver to fetch the default LLM Options for the currently authenticated User """

        # Retrieve the user from the context passed in by the JWT middleware
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        return UserPreferenceService.get_default_llm_options()

def get_query_fields():
    return {
        'user_preference_by_user_id': Field(UserPreference, id=Argument(ID, required=True), resolver=UserPreference.resolve_by_user_id),
        'my_user_preference': Field(UserPreference, resolver=UserPreference.resolve_my_user_preference),
        'default_llm_options':  Field(DefaultLlmOptions, resolver=DefaultLlmOptions.resolve_default_llm_options)
    }

def get_mutation_fields():
    return {
        'update_user_preference': UpdateUserPreference.Field(),
        'update_my_user_preference': UpdateMyUserPreference.Field(),
    }
