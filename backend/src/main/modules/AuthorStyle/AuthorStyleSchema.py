"""
Author Style Schema

This file defines the Author Style GraphQL object type and all mutations associated with a Author Style.
"""
# Import the required modules
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from .AuthorStyleService import AuthorStyleService
from graphql import GraphQLError
from main.libraries.decorators import cache_response
from main.libraries.PagedResult import PagedResult

# Define the AuthorStyle ObjectType
class AuthorStyle(ObjectType):
    """ AuthorStyle GraphQL Object """

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
    @cache_response('author_style_', 'id', 'include_archived', 'global_only')
    def resolve_by_id(cls, root, info, id, include_archived, global_only):
        """ GraphQL Resolver to fetch an Author Style by ID """

        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use AuthorStyleService to find author style by ID
            author_style = AuthorStyleService.find_by_id(id, include_archived, global_only, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if author style not found
            raise GraphQLError(str(e))

        # Return AuthorStyle object
        return author_style.to_dict(user=user_context)

    @classmethod
    @cache_response('author_styles_', 'name_search_term', 'email_search_term', 'id_search_term', 'include_archived', 'global_only', 'page', 'limit')
    def resolve_all_author_styles(cls, root, info, name_search_term, email_search_term, id_search_term, include_archived, global_only, page, limit=None):
        """ GraphQL Resolver to fetch all AuthorStyle with optional pagination and filter """

        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use AuthorStyleService to find all author styles
            author_styles, pages, statistics = AuthorStyleService.find_all(name_search_term, email_search_term, id_search_term, include_archived, global_only, page, limit, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Convert author styles from a generator to a list before caching
        author_styles_list = [cls(**author_style.to_dict(user=user_context)) for author_style in author_styles]

        # Return the serializable list along with pages and statistics
        return AllAuthorStyles(authorStyles=author_styles_list, pages=pages, statistics=statistics)

class AllAuthorStylesStatistics(ObjectType):
    total_count = NonNull(Int)
    total_user_created_count = NonNull(Int)
    total_global_count = NonNull(Int)
    total_archived_count = NonNull(Int)
    total_non_archived_count = NonNull(Int)

# Define a new type to contain the Author Style list and the total page count
class AllAuthorStyles(PagedResult):
    authorStyles = NonNull(List(NonNull(AuthorStyle)))
    statistics = NonNull(AllAuthorStylesStatistics)

# Define the RegisterAuthorStyle Mutation
class RegisterAuthorStyle(Mutation):
    """ RegisterAuthorStyle Mutation to create a new AuthorStyle"""

    author_style = Field(AuthorStyle)

    class Arguments:
        name = String(required=True)
        prompt_text = String(required=True)
        archived = Boolean(required=False, default_value=False)
        is_global = Boolean(required=False, default_value=False)

    def mutate(self, info, name, prompt_text, archived, is_global):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Register a new author style using AuthorStyleService
            author_style_id = AuthorStyleService.register_author_style(name, prompt_text, archived, is_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Fetch the created author style
        new_author_style = AuthorStyleService.find_by_id(author_style_id, archived, is_global, user_context=user_context)

        # Return the created author style
        return RegisterAuthorStyle(author_style=new_author_style.to_dict(user=user_context))

# Define the DeleteAuthorStyle Mutation
class DeleteAuthorStyle(Mutation):
    """ DeleteAuthorStyle Mutation to delete an AuthorStyle"""

    class Arguments:
        id = ID(required=True)

    Output = Boolean

    def mutate(self, info, id):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Delete author style using AuthorStyleService
            is_deleted = AuthorStyleService.delete_author_style(id, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if author style not found
            raise GraphQLError(str(e))

        # Return True if author style has been deleted
        return is_deleted is not None

# Define the UpdateAuthorStyle Mutation
class UpdateAuthorStyle(Mutation):
    """ UpdateAuthorStyle Mutation to update an Author Style's name or prompt text"""

    author_style = Field(AuthorStyle)

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
            # Update author style using AuthorStyleService
            author_style = AuthorStyleService.update_author_style(id, name, prompt_text, archived, is_global, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if author style not found or email already in use
            raise GraphQLError(str(e))

        # Return the updated user
        return UpdateAuthorStyle(author_style=author_style.to_dict(user=user_context))

def get_query_fields():
    return {
        'author_style_by_id': Field(
            AuthorStyle,
            id=Argument(ID, required=True),
            include_archived=Argument(Boolean, default_value=False),
            global_only=Argument(Boolean, default_value=True),
            resolver=AuthorStyle.resolve_by_id
        ),
        'all_author_styles':
        	Field(AllAuthorStyles,
            name_search_term=Argument(String, default_value=''),
            email_search_term=Argument(String, default_value=''),
            id_search_term=Argument(String, default_value=''),
            include_archived=Argument(Boolean, default_value=False),
            global_only=Argument(Boolean, default_value=True),
        	page=Int(default_value=1),
            limit=Int(),
            resolver=AuthorStyle.resolve_all_author_styles)
    }

def get_mutation_fields():
    return {
        'register_author_style': RegisterAuthorStyle.Field(),
        'delete_author_style': DeleteAuthorStyle.Field(),
        'update_author_style': UpdateAuthorStyle.Field()
    }
