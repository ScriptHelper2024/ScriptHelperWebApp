from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from graphene.types.generic import GenericScalar
from .LocationProfileService import LocationProfileService
from graphql import GraphQLError
from datetime import datetime
from main.libraries.decorators import project_role, cache_response

# Define the LocationProfile ObjectType
class LocationProfile(ObjectType):
    id = ID(required=True)
    project_id = ID(required=True)
    location_key = String(required=True)
    location_order = Int()
    name = String(required=True)
    version_type = String(required=True)
    source_version_number = Int()
    version_number = Int(required=True)
    version_label = String()
    text_seed = String()
    text_notes = String()
    text_content = String()
    location_count = Int()
    llm_model = String()
    created_at = DateTime()
    created_by = ID()

    @classmethod
    @project_role(roles=None)
    @cache_response('project_locations_', 'project_id')
    def resolve_list_project_locations(cls, info, project_id):
        try:
            locations = LocationProfileService.list_project_locations(project_id)
            return locations
        except Exception as e:
            raise GraphQLError(str(e))

    @classmethod
    @project_role(roles=None)
    @cache_response('location_profile_', 'project_id', 'text_id', 'location_key', 'version_number')
    def resolve_location_profile(cls, info, **kwargs):
        try:
            # Extract arguments with .get() to allow for None values if they are not present
            text_id = kwargs.get('text_id')
            location_key = kwargs.get('location_key')
            version_number = kwargs.get('version_number')
            project_id = kwargs.get('project_id')

            # Call the service method with the extracted parameters
            location_profile = LocationProfileService.get_location_profile(text_id, location_key, version_number)
            if not location_profile:
                raise GraphQLError('Location text not found')

            # Convert the location_profile to a dictionary using the method from the ObjectType
            return location_profile._to_dict()
        except Exception as e:
            raise GraphQLError(f'Error retrieving location text: {str(e)}')

    @classmethod
    @project_role(roles=None)
    @cache_response('location_profile_versions_', 'project_id', 'location_key')
    def resolve_location_versions(cls, info, project_id, location_key):
        try:
            # Directly return the list of dictionaries from the service
            versions = LocationProfileService.list_location_versions(location_key)
            return versions
        except Exception as e:
            raise GraphQLError(str(e))

class CreateLocationProfile(Mutation):
    class Arguments:
        project_id = ID(required=True)
        name = String(required=True)
        text_seed = String()
        location_order_after = Int()

    location_profile = Field(LocationProfile)

    @project_role(roles="owner")
    def mutate(self, info, project_id, name, text_seed=None, location_order_after=None):
        user = info.context.get('user')
        try:
            new_location_profile = LocationProfileService.create_location_profile(
                project_id, user, name, text_seed, location_order_after
            )
            return CreateLocationProfile(location_profile=new_location_profile._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

class DeleteLocationByKey(Mutation):
    class Arguments:
        project_id = ID(required=True)
        location_key = String(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, location_key):
        try:
            LocationProfileService.delete_location(location_key)
            return DeleteLocationByKey(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutations
class RebaseLocationProfile(Mutation):
    class Arguments:
        project_id = ID(required=True)
        location_key = String()
        location_profile_id = ID()
        version_number = Int()

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, location_key=None, location_profile_id=None, version_number=None):
        try:
            LocationProfileService.rebase_location_profile(location_profile_id, location_key, version_number)
            return RebaseLocationProfile(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateLocationVersionLabel(Mutation):
    class Arguments:
        project_id = ID(required=True)
        location_key = String()
        location_profile_id = ID()
        version_number = Int()
        version_label = String(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, version_label, location_key=None, location_profile_id=None, version_number=None):
        try:
            LocationProfileService.update_version_label(location_profile_id, location_key, version_number, version_label)
            return UpdateLocationVersionLabel(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class ReorderLocation(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        new_location_order = Int(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id,  text_id, new_location_order):
        try:
            LocationProfileService.reorder_location(text_id, new_location_order)
            return ReorderLocation(success=True)
        except ValueError as e:
            raise GraphQLError(str(e))
        except Exception as e:
            raise GraphQLError(f"Unexpected error occurred: {str(e)}")

class UpdateLocationProfile(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        name = String()
        text_seed = String()
        text_notes = String()
        text_content = String()

    location_profile = Field(LocationProfile)

    @project_role(roles="owner")
    def mutate(self, info, project_id, text_id, name=None, text_seed=None, text_notes=None, text_content=None):
        user = info.context.get('user')
        try:
            updated_location_profile = LocationProfileService.update_location_profile(text_id, user, name, text_seed, text_notes, text_content)
            return UpdateLocationProfile(location_profile=updated_location_profile._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating location text from seed
class GenerateLocationFromSeed(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        text_seed = String()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, project_id, text_id, text_seed=None):
        user = info.context.get('user')
        try:
            # Call the generate_from_seed method and pass the user ID
            agent_task_id = LocationProfileService.generate_from_seed(
                project_id, text_id, text_seed, user.id
            )
            return GenerateLocationFromSeed(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating location text with notes
class GenerateLocationWithNotes(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        text_notes = String()
        select_text_start = Int()
        select_text_end = Int()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, project_id, text_id, text_notes=None, select_text_start=None, select_text_end=None):
        user = info.context.get('user')
        try:
            # Call the generate_from_seed method and pass the user ID
            agent_task_id = LocationProfileService.generate_with_notes(
                project_id, text_id, text_notes, user.id, select_text_start, select_text_end
            )

            return GenerateLocationWithNotes(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))


def get_query_fields():
    return {
        'list_project_locations': List(
            LocationProfile,
            project_id=ID(required=True),
            resolver=lambda self, info, **args: LocationProfile.resolve_list_project_locations(info, **args)
        ),
        'get_location_profile': Field(
            LocationProfile,
            text_id=ID(),
            project_id=ID(required=True),
            location_key=String(),
            version_number=Int(),
            resolver=lambda self, info, **args: LocationProfile.resolve_location_profile(info, **args)
        ),
        'list_location_versions': List(
            LocationProfile,
            project_id=ID(required=True),
            location_key=String(required=True),
            resolver=lambda self, info, **args: LocationProfile.resolve_location_versions(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'create_location_profile': CreateLocationProfile.Field(),
        'reorder_location': ReorderLocation.Field(),
        'delete_location_by_key': DeleteLocationByKey.Field(),
        'rebase_location_profile': RebaseLocationProfile.Field(),
        'update_location_version_label': UpdateLocationVersionLabel.Field(),
        'update_location_profile': UpdateLocationProfile.Field(),
        'generate_location_from_seed': GenerateLocationFromSeed.Field(),
        'generate_location_with_notes': GenerateLocationWithNotes.Field(),
    }
