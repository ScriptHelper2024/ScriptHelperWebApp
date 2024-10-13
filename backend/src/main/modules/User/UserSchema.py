"""
User Schema

This file defines the User GraphQL object type and all mutations associated with a User.
"""
# Import the required modules
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from .UserService import UserService
from graphql import GraphQLError
from main.libraries.decorators import admin_required, cache_response
from main.libraries.PagedResult import PagedResult

# Define the User ObjectType
class User(ObjectType):
    """ User GraphQL Object """

    id = ID(required=True)
    email = String(required=True)
    first_name = String()
    last_name = String()
    created_at = DateTime()
    modified_at = DateTime()
    email_verified = Boolean()
    verified_at = DateTime()
    admin_level = Int()

    @classmethod
    @cache_response('me_')
    def resolve_me(cls, root, info):
        """ GraphQL Resolver to fetch the currently authenticated User """

        # Retrieve the user from the context passed in by the JWT middleware
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        # Use _user_to_dict to get a dictionary representation of the user
        user_dict = user._to_dict()

        # Return User object
        return cls(**user_dict)

    @classmethod
    @admin_required(required_level=1)
    @cache_response('user_', 'id')
    def resolve_by_id(cls, root, info, id):
        """ GraphQL Resolver to fetch a User by ID """

        try:
            # Use UserService to find user by ID
            user = UserService.find_by_id(id)
        except ValueError as e:
            # Raise GraphQLError if user not found
            raise GraphQLError(str(e))

        # Use _user_to_dict to get a dictionary representation of the user
        user_dict = user._to_dict()

        # Return User object
        return cls(**user_dict)

    @classmethod
    @admin_required(required_level=1)
    @cache_response('user_email_', 'email')
    def resolve_by_email(cls, root, info, email):
        """ GraphQL Resolver to fetch a User by Email """

        try:
            # Use UserService to find user by Email
            user = UserService.find_by_email(email)
        except ValueError as e:
            # Raise GraphQLError if user not found
            raise GraphQLError(str(e))

        # Use _user_to_dict to get a dictionary representation of the user
        user_dict = user._to_dict()

        # Return User object
        return cls(**user_dict)

    @classmethod
    @admin_required(required_level=1)
    @cache_response('users_', 'page', 'limit', 'email', 'from_date', 'to_date')
    def resolve_all_users(cls, root, info, page=1, limit=None, email=None, from_date=None, to_date=None):
        """ GraphQL Resolver to fetch all Users with optional pagination and filter by Email """
        try:
            # Use UserService to find all users
            users, pages, statistics = UserService.find_all(page, limit, email, from_date, to_date)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Convert users to list of User objects
        user_objs = [cls(**user._to_dict()) for user in users]

        # Return UsersWithTotalPages object
        return UsersWithTotalPages(users=user_objs, pages=pages, statistics=statistics)

# Define a new type to contain statistics about the user query
class UserStatistics(ObjectType):
    total_users_count = NonNull(Int)
    verified_users_count = NonNull(Int)

# Define a new type to contain the users list and the total page count
class UsersWithTotalPages(PagedResult):
    users = NonNull(List(NonNull(User)))
    statistics = NonNull(UserStatistics)

# Define the RegisterUser Mutation
class RegisterUser(Mutation):
    """ RegisterUser Mutation to create a new User """

    user = Field(User)
    access_token = String()

    class Arguments:
        email = String(required=True)
        password = String(required=True)
        first_name = String()
        last_name = String()

    def mutate(self, info, email, password, first_name=None, last_name=None):
        """ Resolve the mutation """

        try:
            # Register a new user using UserService
            user_id, access_token = UserService.register_user(email, first_name, last_name, password, user_context=info.context.get('user', None))
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Fetch the created user
        new_user = UserService.find_by_id(user_id)

        # Return the created user
        return RegisterUser(
                user=new_user,
                access_token=access_token,
        )

# Define the DeleteUser Mutation
class DeleteUser(Mutation):
    """ DeleteUser Mutation to delete a User """

    class Arguments:
        id = ID(required=True)

    Output = Boolean

    @admin_required(required_level=1)
    def mutate(self, info, id):
        """ Resolve the mutation """

        try:
            # Delete user using UserService
            is_deleted = UserService.delete_user(id)
        except ValueError as e:
            # Raise GraphQLError if user not found
            raise GraphQLError(str(e))

        # Return True if user has been deleted
        return is_deleted is not None

# Define the UpdateUser Mutation
class UpdateUser(Mutation):
    """ UpdateUser Mutation to update a User's email or password """

    user = Field(User)

    class Arguments:
        id = ID(required=True)
        email = String()
        password = String()
        first_name = String()
        last_name = String()

    @admin_required(required_level=1)
    def mutate(self, info, id, email=None, password=None, first_name=None, last_name=None):
        """ Resolve the mutation """

        try:
            # Update user using UserService
            user = UserService.update_user(id, email, password, first_name, last_name)
        except ValueError as e:
            # Raise GraphQLError if user not found or email already in use
            raise GraphQLError(str(e))

        # Return the updated user
        return UpdateUser(user=user)

# Define the UpdateMe Mutation
class UpdateMe(Mutation):
    """ UpdateMe Mutation to update the currently logged in User's account settings """

    user = Field(User)

    class Arguments:
        email = String()
        password = String()
        first_name = String()
        last_name = String()

    def mutate(self, info, email=None, password=None, first_name=None, last_name=None):
        """ Resolve the mutation """

        # Retrieve the currently logged in user from the context
        current_user = info.context.get('user')

        # Check if a user is logged in
        if not current_user:
            raise GraphQLError('Not authorized')

        try:
            # Update user using UserService, using the id from the in context user
            user = UserService.update_user(str(current_user.id), email, password, first_name, last_name)
        except ValueError as e:
            # Raise GraphQLError if user not found or email already in use
            raise GraphQLError(str(e))

        # Return the updated user
        return UpdateMe(user=user)

def get_query_fields():
    return {
        'me': Field(User, resolver=User.resolve_me),
        'user_by_id': Field(User, id=Argument(ID, required=True), resolver=User.resolve_by_id),
        'user_by_email': Field(User, email=Argument(String, required=True), resolver=User.resolve_by_email),
        'all_users': Field(UsersWithTotalPages, page=Int(default_value=1), limit=Int(), email=String(), from_date=DateTime(), to_date=DateTime(), resolver=User.resolve_all_users)
    }

def get_mutation_fields():
    return {
        'register_user': RegisterUser.Field(),
        'delete_user': DeleteUser.Field(),
        'update_user': UpdateUser.Field(),
        'update_me': UpdateMe.Field()
    }
