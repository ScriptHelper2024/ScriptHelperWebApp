"""
Script Dialog Flavor Schema

This file defines the Script Dialog Flavor GraphQL object type and all mutations associated with a Script Dialog Flavor.
"""
# Import the required modules
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from .ScriptDialogFlavorService import ScriptDialogFlavorService
from graphql import GraphQLError
from main.libraries.decorators import cache_response
from main.libraries.PagedResult import PagedResult

# Define the ScriptDialogFlavor ObjectType
class ScriptDialogFlavor(ObjectType):
    """ ScriptDialogFlavor GraphQL Object """

    id = ID(required=True)
    name = String(required=True)
    prompt_text = String()
    user_id = ID(required=True)
    creator_email = String(required=True)
    archived = Boolean(required=True, default_value=False)
    is_global = Boolean(required=True, default_value=False)
    created_at = DateTime()
    modified_at = DateTime()

    @classmethod
    @cache_response('script_dialog_flavor_', 'id', 'include_archived', 'global_only')
    def resolve_by_id(cls, root, info, id, include_archived, include_global):
        """ GraphQL Resolver to fetch an Script Dialog Flavor by ID """

        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use ScriptDialogFlavorService to find script dialog flavor by ID
            script_dialog_flavor = ScriptDialogFlavorService.find_by_id(id, include_archived, include_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if script dialog flavor not found
            raise GraphQLError(str(e))

        # Return ScriptDialogFlavor object
        return cls(**script_dialog_flavor.to_dict(user=user_context))

    @classmethod
    @cache_response('script_dialog_flavors_', 'name_search_term', 'email_search_term', 'id_search_term', 'include_archived', 'global_only', 'page', 'limit')
    def resolve_all_script_dialog_flavors(cls, root, info, name_search_term, email_search_term, id_search_term, include_archived, global_only, page, limit=None):
        """ GraphQL Resolver to fetch all ScriptDialogFlavor with optional pagination and filter """
        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use ScriptDialogFlavorService to find all script dialog flavors
            script_dialog_flavors, pages, statistics = ScriptDialogFlavorService.find_all(name_search_term, email_search_term, id_search_term, include_archived, global_only, page, limit, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Convert script dialog flavors from a generator to a list before caching
        script_dialog_flavors_list = [cls(**script_dialog_flavor.to_dict(user=user_context)) for script_dialog_flavor in script_dialog_flavors]

        # Return the serializable list along with pages and statistics
        return AllScriptDialogFlavors(scriptDialogFlavors=script_dialog_flavors_list, pages=pages, statistics=statistics)
        
class AllScriptDialogFlavorStatistics(ObjectType):
    total_count = NonNull(Int)
    total_user_created_count = NonNull(Int)
    total_global_count = NonNull(Int)
    total_archived_count = NonNull(Int)
    total_non_archived_count = NonNull(Int)

# Define a new type to contain the Script Dialog Flavors list and the total page count
class AllScriptDialogFlavors(PagedResult):
    scriptDialogFlavors = NonNull(List(NonNull(ScriptDialogFlavor)))
    statistics = NonNull(AllScriptDialogFlavorStatistics)

# Define the RegisterScriptDialogFlavor Mutation
class RegisterScriptDialogFlavor(Mutation):
    """ RegisterScriptDialogFlavor Mutation to create a new ScriptDialogFlavor"""

    script_dialog_flavor = Field(ScriptDialogFlavor)

    class Arguments:
        name = String(required=True)
        prompt_text = String(required=True)
        archived = Boolean(required=False, default_value=False)
        is_global = Boolean(required=False, default_value=False)

    def mutate(self, info, name, prompt_text, archived, is_global):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Register a new script dialog flavor using ScriptDialogFlavorService
            script_dialog_flavor_id = ScriptDialogFlavorService.register_script_dialog_flavor(name, prompt_text, archived, is_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Fetch the created script dialog flavor
        new_script_dialog_flavor = ScriptDialogFlavorService.find_by_id(script_dialog_flavor_id, archived, is_global, user_context=user_context)

        # Return the created script dialog flavor
        return RegisterScriptDialogFlavor(script_dialog_flavor=new_script_dialog_flavor.to_dict(user=user_context))

# Define the DeleteScriptDialogFlavor Mutation
class DeleteScriptDialogFlavor(Mutation):
    """ DeleteScriptDialogFlavor Mutation to delete an ScriptDialogFlavor"""

    class Arguments:
        id = ID(required=True)

    Output = Boolean

    def mutate(self, info, id):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Delete script dialog flavor using ScriptDialogFlavorService
            is_deleted = ScriptDialogFlavorService.delete_script_dialog_flavor(id, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if script dialog flavor not found
            raise GraphQLError(str(e))

        # Return True if script dialog flavor has been deleted
        return is_deleted is not None

# Define the UpdateScriptDialogFlavor Mutation
class UpdateScriptDialogFlavor(Mutation):
    """ UpdateScriptDialogFlavor Mutation to update an Script Dialog Flavor's name or prompt text"""

    script_dialog_flavor = Field(ScriptDialogFlavor)

    class Arguments:
        id = ID(required=True)
        name = String(required=False, default_value=None)
        prompt_text = String(required=False, default_value=None)
        archived = Boolean(required=False, default_value=None)
        is_global = Boolean(required=False, default_value=None)

    def mutate(self, info, id, name, prompt_text, archived, is_global):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Update script dialog flavor using ScriptDialogFlavorService
            script_dialog_flavor = ScriptDialogFlavorService.update_script_dialog_flavor(id, name, prompt_text, archived, is_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if script dialog flavor not found or email already in use
            raise GraphQLError(str(e))

        # Return the updated user
        return UpdateScriptDialogFlavor(script_dialog_flavor=script_dialog_flavor.to_dict(user=user_context))

def get_query_fields():
    return {
        'script_dialog_flavor_by_id': Field(
            ScriptDialogFlavor,
            id=Argument(ID, required=True),
            include_archived=Argument(Boolean, default_value=False),
            include_global=Argument(Boolean, default_value=True),
            resolver=ScriptDialogFlavor.resolve_by_id
        ),
        'all_script_dialog_flavors':
        	Field(AllScriptDialogFlavors,
            name_search_term=Argument(String, default_value=''),
            email_search_term=Argument(String, default_value=''),
            id_search_term=Argument(String, default_value=''),
			include_archived=Argument(Boolean, default_value=False),
            global_only=Argument(Boolean, default_value=True),
        	page=Int(default_value=1),
            limit=Int(),
            resolver=ScriptDialogFlavor.resolve_all_script_dialog_flavors)
    }

def get_mutation_fields():
    return {
        'register_script_dialog_flavor': RegisterScriptDialogFlavor.Field(),
        'delete_script_dialog_flavor': DeleteScriptDialogFlavor.Field(),
        'update_script_dialog_flavor': UpdateScriptDialogFlavor.Field()
    }
