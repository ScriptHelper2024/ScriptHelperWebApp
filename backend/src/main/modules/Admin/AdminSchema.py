# Import the required modules from graphene
from graphene import ObjectType, Mutation, Field, Int, String, Boolean, List
from graphql import GraphQLError
from main.libraries.decorators import admin_required
from graphene.types import Scalar
from graphql.language import ast
from .AdminService import AdminService
import json

class DynamicValue(Scalar):
    """
    A custom scalar type to interpret dynamic values (json, int, string).
    """

    @staticmethod
    def serialize(value):
        # Serialization for outgoing responses
        if isinstance(value, (dict, list)):
            return json.dumps(value)
        return value

    @staticmethod
    def parse_literal(node):
        # Interpret incoming literals (queries/mutations) appropriately
        if isinstance(node, ast.StringValue):
            try:
                return json.loads(node.value)
            except json.JSONDecodeError:
                return node.value
        elif isinstance(node, (ast.IntValue, ast.FloatValue)):
            return int(node.value) if node.value.isdigit() else float(node.value)
        elif isinstance(node, ast.BooleanValue):
            return bool(node.value)
        # Add more types if necessary
        return None

    @staticmethod
    def parse_value(value):
        # Parse incoming values from variables
        if isinstance(value, str):
            try:
                return json.loads(value)
            except ValueError:
                return value
        return value

class PlatformStats(ObjectType):
    """
    PlatformStats GraphQL Object Type

    This object type is used to query platform-wide statistics,
    providing an overview of various statistics across the platform.
    """
    project = Int()
    story_text = Int()
    scene_text = Int()
    beat_sheet = Int()
    script_text = Int()
    character_profile = Int()
    location_profile = Int()
    suggested_story_title = Int()

    @classmethod
    @admin_required(required_level=1)
    def resolve_statistics(cls, root, info, start_date=None, end_date=None):
        """
        Resolver method for fetching platform statistics.

        Accepts optional arguments for start_date and end_date to filter results.
        """
        try:
            # Call the AdminService to get statistics directly in the desired format
            stats = AdminService.get_platform_statistics(start_date=start_date, end_date=end_date)
            return PlatformStats(**stats)
        except Exception as e:
            raise GraphQLError(str(e))

class PlatformSetting(ObjectType):
    """
    PlatformSetting GraphQL Object Type for querying platform settings.
    """
    id = String()
    key = String()
    value = DynamicValue()
    created_at = String()
    modified_at = String()

    @classmethod
    @admin_required(required_level=1)
    def resolve_platform_setting(cls, root, info, key):
        """
        Resolver method for fetching a platform setting by key.
        """
        try:
            setting = AdminService.get_platform_setting(key)
            if setting is None:
                raise ValueError("Platform setting not found.")
            return setting._to_dict()  # Use the _to_dict method for normalized output
        except Exception as e:
            raise GraphQLError(str(e))

    @classmethod
    @admin_required(required_level=1)
    def resolve_list_platform_settings(cls, root, info):
        """
        Resolver method for listing all platform settings.
        """
        try:
            settings = AdminService.list_platform_settings()
            return [setting._to_dict() for setting in settings]  # Convert each setting to a dictionary
        except Exception as e:
            raise GraphQLError(str(e))

class UpdatePlatformSetting(Mutation):
    """
    UpdatePlatformSetting Mutation to update a platform setting's value.
    """
    class Arguments:
        key = String(required=True)
        value = String(required=True)

    success = Boolean()

    @staticmethod
    @admin_required(required_level=1)
    def mutate(root, info, key, value):
        """
        Resolve the mutation. Attempts to decode the JSON from the string before
        passing it into update_platform_setting. If decoding fails, passes the value in raw.
        """
        try:
            # Attempt to parse the JSON string into a Python object
            parsed_value = json.loads(value)
        except ValueError:
            # If JSON decoding fails, use the raw string value
            parsed_value = value

        try:
            AdminService.update_platform_setting(key, parsed_value)
            return UpdatePlatformSetting(success=True)
        except ValueError as e:
            raise GraphQLError(str(e))


# Function to return query fields and resolvers
def get_query_fields():
    return {
        'platform_statistics': Field(PlatformStats, start_date=String(), end_date=String(), resolver=PlatformStats.resolve_statistics),
        'platform_setting': Field(PlatformSetting, key=String(required=True), resolver=PlatformSetting.resolve_platform_setting),
        'list_platform_settings': Field(List(PlatformSetting), resolver=PlatformSetting.resolve_list_platform_settings)
    }

# This function will return the mutation fields if any
def get_mutation_fields():
    return {
        'update_platform_setting': UpdatePlatformSetting.Field(),
    }
