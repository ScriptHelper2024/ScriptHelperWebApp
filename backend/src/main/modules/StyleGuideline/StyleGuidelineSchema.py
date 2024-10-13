"""
Style Guideline Schema
src/tests/test_style_guideline.py

This file defines the Style Guideline GraphQL object type and all mutations associated with a Style Guideline.
"""
# Import the required modules
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from .StyleGuidelineService import StyleGuidelineService
from graphql import GraphQLError
from main.libraries.PagedResult import PagedResult
from main.libraries.decorators import cache_response

# Define the StyleGuideline ObjectType
class StyleGuideline(ObjectType):
    """ StyleGuideline GraphQL Object """

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
    @cache_response('style_guideline_', 'id', 'include_archived', 'global_only')
    def resolve_by_id(cls, root, info, id, include_archived, include_global):
        """ GraphQL Resolver to fetch an Style Guideline by ID """

        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use StyleGuidelineService to find style guideline by ID
            style_guideline = StyleGuidelineService.find_by_id(id, include_archived, include_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if style guideline not found
            raise GraphQLError(str(e))

        # Return StyleGuideline object
        return cls(**style_guideline.to_dict(user=user_context))

    @classmethod
    @cache_response('style_guidelines_', 'name_search_term', 'email_search_term', 'id_search_term', 'include_archived', 'global_only', 'page', 'limit')
    def resolve_all_style_guidelines(cls, root, info, name_search_term, email_search_term, id_search_term, include_archived, global_only, page, limit=None):
        """ GraphQL Resolver to fetch all StyleGuideline with optional pagination and filter """

        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use StyleGuidelineService to find all style guidelines
            style_guidelines, pages, statistics = StyleGuidelineService.find_all(name_search_term, email_search_term, id_search_term, include_archived, global_only, page, limit, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Convert style guidelines from a generator to a list before caching
        style_guidelines_list = [cls(**style_guideline.to_dict(user=user_context)) for style_guideline in style_guidelines]

        # Return the serializable list along with pages and statistics
        return AllStyleGuidelines(styleGuidelines=style_guidelines_list, pages=pages, statistics=statistics)
        
class AllStyleGuidelinesStatistics(ObjectType):
    total_count = NonNull(Int)
    total_user_created_count = NonNull(Int)
    total_global_count = NonNull(Int)
    total_archived_count = NonNull(Int)
    total_non_archived_count = NonNull(Int)

# Define a new type to contain the Author Style list and the total page count
class AllStyleGuidelines(PagedResult):
    styleGuidelines = NonNull(List(NonNull(StyleGuideline)))
    statistics = NonNull(AllStyleGuidelinesStatistics)

# Define the RegisterStyleGuideline Mutation
class RegisterStyleGuideline(Mutation):
    """ RegisterStyleGuideline Mutation to create a new StyleGuideline"""

    style_guideline = Field(StyleGuideline)

    class Arguments:
        name = String(required=True)
        prompt_text = String(required=True)
        archived = Boolean(required=False, default_value=False)
        is_global = Boolean(required=False, default_value=False)

    def mutate(self, info, name, prompt_text, archived, is_global):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Register a new style guideline using StyleGuidelineService
            style_guideline_id = StyleGuidelineService.register_style_guideline(name, prompt_text, archived, is_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Fetch the created style guideline
        new_style_guideline = StyleGuidelineService.find_by_id(style_guideline_id, archived, is_global, user_context=user_context)

        # Return the created style guideline
        return RegisterStyleGuideline(style_guideline=new_style_guideline.to_dict(user=user_context))

# Define the DeleteStyleGuideline Mutation
class DeleteStyleGuideline(Mutation):
    """ DeleteStyleGuideline Mutation to delete an StyleGuideline"""

    class Arguments:
        id = ID(required=True)

    Output = Boolean

    def mutate(self, info, id):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Delete style guideline using StyleGuidelineService
            is_deleted = StyleGuidelineService.delete_style_guideline(id, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if style guideline not found
            raise GraphQLError(str(e))

        # Return True if style guideline has been deleted
        return is_deleted is not None

# Define the UpdateStyleGuideline Mutation
class UpdateStyleGuideline(Mutation):
    """ UpdateStyleGuideline Mutation to update an Style Guideline's name or prompt text"""

    style_guideline = Field(StyleGuideline)

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
            # Update style guideline using StyleGuidelineService
            style_guideline = StyleGuidelineService.update_style_guideline(id, name, prompt_text, archived, is_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if style guideline not found or email already in use
            raise GraphQLError(str(e))

        # Return the updated user
        return UpdateStyleGuideline(style_guideline=style_guideline.to_dict(user=user_context))

def get_query_fields():
    return {
        'style_guideline_by_id': Field(
            StyleGuideline,
            id=Argument(ID, required=True),
            include_archived=Argument(Boolean, default_value=False),
            include_global=Argument(Boolean, default_value=True),
            resolver=StyleGuideline.resolve_by_id
        ),
        'all_style_guidelines':
        	Field(AllStyleGuidelines,
			name_search_term=Argument(String, default_value=''),
            email_search_term=Argument(String, default_value=''),
            id_search_term=Argument(String, default_value=''),
            include_archived=Argument(Boolean, default_value=False),
            global_only=Argument(Boolean, default_value=True),
        	page=Int(default_value=1),
            limit=Int(),
            resolver=StyleGuideline.resolve_all_style_guidelines)
    }

def get_mutation_fields():
    return {
        'register_style_guideline': RegisterStyleGuideline.Field(),
        'delete_style_guideline': DeleteStyleGuideline.Field(),
        'update_style_guideline': UpdateStyleGuideline.Field()
    }
