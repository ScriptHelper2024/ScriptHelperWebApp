from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from graphene.types.generic import GenericScalar
from .CharacterProfileService import CharacterProfileService
from graphql import GraphQLError
from datetime import datetime
from main.libraries.decorators import project_role, cache_response

# Define the CharacterProfile ObjectType
class CharacterProfile(ObjectType):
    id = ID(required=True)
    project_id = ID(required=True)
    character_key = String(required=True)
    character_order = Int()
    name = String(required=True)
    version_type = String(required=True)
    source_version_number = Int()
    version_number = Int(required=True)
    version_label = String()
    text_seed = String()
    text_notes = String()
    text_content = String()
    character_count = Int()
    llm_model = String()
    created_at = DateTime()
    created_by = ID()

    @classmethod
    @project_role(roles=None)
    @cache_response('project_characters_', 'project_id')
    def resolve_list_project_characters(cls, info, project_id):
        try:
            characters = CharacterProfileService.list_project_characters(project_id)
            return characters
        except Exception as e:
            raise GraphQLError(str(e))

    @classmethod
    @project_role(roles=None)
    @cache_response('character_profile_', 'project_id', 'text_id', 'character_key', 'version_number')
    def resolve_character_profile(cls, info, **kwargs):
        try:
            # Extract arguments with .get() to allow for None values if they are not present
            text_id = kwargs.get('text_id')
            character_key = kwargs.get('character_key')
            version_number = kwargs.get('version_number')
            project_id = kwargs.get('project_id')

            # Call the service method with the extracted parameters
            character_profile = CharacterProfileService.get_character_profile(text_id, character_key, version_number)
            if not character_profile:
                raise GraphQLError('Character text not found')

            # Convert the character_profile to a dictionary using the method from the ObjectType
            return character_profile._to_dict()
        except Exception as e:
            raise GraphQLError(f'Error retrieving character text: {str(e)}')

    @classmethod
    @project_role(roles=None)
    @cache_response('character_profile_versions_', 'project_id', 'character_key')
    def resolve_character_versions(cls, info, project_id, character_key):
        try:
            # Directly return the list of dictionaries from the service
            versions = CharacterProfileService.list_character_versions(character_key)
            return versions
        except Exception as e:
            raise GraphQLError(str(e))

class CreateCharacterProfile(Mutation):
    class Arguments:
        project_id = ID(required=True)
        name = String(required=True)
        text_seed = String()
        character_order_after = Int()

    character_profile = Field(CharacterProfile)

    @project_role(roles="owner")
    def mutate(self, info, project_id, name, text_seed=None, character_order_after=None):
        user = info.context.get('user')
        try:
            new_character_profile = CharacterProfileService.create_character_profile(
                project_id, user, name, text_seed, character_order_after
            )
            return CreateCharacterProfile(character_profile=new_character_profile._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

class DeleteCharacterByKey(Mutation):
    class Arguments:
        project_id = ID(required=True)
        character_key = String(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, character_key):
        try:
            CharacterProfileService.delete_character(character_key)
            return DeleteCharacterByKey(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutations
class RebaseCharacterProfile(Mutation):
    class Arguments:
        project_id = ID(required=True)
        character_key = String()
        character_profile_id = ID()
        version_number = Int()

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, character_key=None, character_profile_id=None, version_number=None):
        try:
            CharacterProfileService.rebase_character_profile(character_profile_id, character_key, version_number)
            return RebaseCharacterProfile(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateCharacterVersionLabel(Mutation):
    class Arguments:
        project_id = ID(required=True)
        character_key = String()
        character_profile_id = ID()
        version_number = Int()
        version_label = String(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, version_label, character_key=None, character_profile_id=None, version_number=None):
        try:
            CharacterProfileService.update_version_label(character_profile_id, character_key, version_number, version_label)
            return UpdateCharacterVersionLabel(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class ReorderCharacter(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        new_character_order = Int(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id,  text_id, new_character_order):
        try:
            CharacterProfileService.reorder_character(text_id, new_character_order)
            return ReorderCharacter(success=True)
        except ValueError as e:
            raise GraphQLError(str(e))
        except Exception as e:
            raise GraphQLError(f"Unexpected error occurred: {str(e)}")

class UpdateCharacterProfile(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        name = String()
        text_seed = String()
        text_notes = String()
        text_content = String()

    character_profile = Field(CharacterProfile)

    @project_role(roles="owner")
    def mutate(self, info, project_id, text_id, name=None, text_seed=None, text_notes=None, text_content=None):
        user = info.context.get('user')
        try:
            updated_character_profile = CharacterProfileService.update_character_profile(text_id, user, name, text_seed, text_notes, text_content)
            return UpdateCharacterProfile(character_profile=updated_character_profile._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating character text from seed
class GenerateCharacterFromSeed(Mutation):
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
            agent_task_id = CharacterProfileService.generate_from_seed(
                project_id, text_id, text_seed, user.id
            )
            return GenerateCharacterFromSeed(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating character text with notes
class GenerateCharacterWithNotes(Mutation):
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
            agent_task_id = CharacterProfileService.generate_with_notes(
                project_id, text_id, text_notes, user.id, select_text_start, select_text_end
            )

            return GenerateCharacterWithNotes(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))


def get_query_fields():
    return {
        'list_project_characters': List(
            CharacterProfile,
            project_id=ID(required=True),
            resolver=lambda self, info, **args: CharacterProfile.resolve_list_project_characters(info, **args)
        ),
        'get_character_profile': Field(
            CharacterProfile,
            text_id=ID(),
            project_id=ID(required=True),
            character_key=String(),
            version_number=Int(),
            resolver=lambda self, info, **args: CharacterProfile.resolve_character_profile(info, **args)
        ),
        'list_character_versions': List(
            CharacterProfile,
            project_id=ID(required=True),
            character_key=String(required=True),
            resolver=lambda self, info, **args: CharacterProfile.resolve_character_versions(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'create_character_profile': CreateCharacterProfile.Field(),
        'reorder_character': ReorderCharacter.Field(),
        'delete_character_by_key': DeleteCharacterByKey.Field(),
        'rebase_character_profile': RebaseCharacterProfile.Field(),
        'update_character_version_label': UpdateCharacterVersionLabel.Field(),
        'update_character_profile': UpdateCharacterProfile.Field(),
        'generate_character_from_seed': GenerateCharacterFromSeed.Field(),
        'generate_character_with_notes': GenerateCharacterWithNotes.Field(),
    }
