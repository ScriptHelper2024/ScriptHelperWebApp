from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from graphene.types.generic import GenericScalar
from .StoryTextService import StoryTextService
from graphql import GraphQLError
from datetime import datetime
from main.libraries.decorators import project_role, cache_response

# Define the StoryText ObjectType
class StoryText(ObjectType):
    id = ID(required=True)
    project_id = ID(required=True)
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
    @cache_response('story_text_', 'text_id', 'project_id', 'version_number')
    def resolve_story_text(self, info, **kwargs):
        try:
            # Extract arguments with .get() to allow for None values if they are not present
            text_id = kwargs.get('text_id')
            project_id = kwargs.get('project_id')
            version_number = kwargs.get('version_number')

            # Call the service method with the extracted parameters
            story_text = StoryTextService.get_story_text(text_id, project_id, version_number)
            if not story_text:
                raise GraphQLError('Story text not found')

            # Convert the story_text to a dictionary using the method from the ObjectType
            return story_text._to_dict()
        except Exception as e:
            raise GraphQLError(f'Error retrieving story text: {str(e)}')

    @classmethod
    @project_role(roles=None)
    @cache_response('story_text_versions_', 'project_id')
    def resolve_story_versions(cls, info, project_id):
        try:
            # Directly return the list of dictionaries from the service
            versions = StoryTextService.list_story_versions(project_id)
            return versions
        except Exception as e:
            raise GraphQLError(str(e))

# Mutations
class RebaseStoryText(Mutation):
    class Arguments:
        story_text_id = ID()
        project_id = ID(required=True)
        version_number = Int()

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, story_text_id=None, version_number=None):
        try:
            StoryTextService.rebase_story_text(story_text_id, project_id, version_number)
            return RebaseStoryText(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateStoryVersionLabel(Mutation):
    class Arguments:
        story_text_id = ID()
        project_id = ID(required=True)
        version_number = Int()
        version_label = String(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, version_label, story_text_id=None, version_number=None):
        try:
            StoryTextService.update_version_label(story_text_id, project_id, version_number, version_label)
            return UpdateStoryVersionLabel(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateStoryText(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        text_seed = String()
        text_notes = String()
        text_content = String()

    story_text = Field(StoryText)

    @project_role(roles="owner")
    def mutate(self, info, project_id, text_id, text_seed=None, text_notes=None, text_content=None):
        user = info.context.get('user')
        try:
            updated_story_text = StoryTextService.update_story_text(text_id, user, text_seed, text_notes, text_content)
            return UpdateStoryText(story_text=updated_story_text._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating story text from seed
class GenerateStoryFromSeed(Mutation):
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
            agent_task_id = StoryTextService.generate_from_seed(
                project_id, text_id, text_seed, user.id
            )
            return GenerateStoryFromSeed(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating story text with notes
class GenerateStoryWithNotes(Mutation):
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
            agent_task_id = StoryTextService.generate_with_notes(
                project_id, text_id, text_notes, user.id, select_text_start, select_text_end
            )

            return GenerateStoryWithNotes(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

def get_query_fields():
    return {
        'get_story_text': Field(
            StoryText,
            text_id=ID(),
            project_id=ID(),
            version_number=Int(),
            resolver=lambda self, info, **args: StoryText.resolve_story_text(info, **args)
        ),
        'list_story_versions': List(
            StoryText,
            project_id=ID(required=True),
            resolver=lambda self, info, **args: StoryText.resolve_story_versions(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'rebase_story_text': RebaseStoryText.Field(),
        'update_story_version_label': UpdateStoryVersionLabel.Field(),
        'update_story_text': UpdateStoryText.Field(),
        'generate_story_from_seed': GenerateStoryFromSeed.Field(),
        'generate_story_with_notes': GenerateStoryWithNotes.Field()
    }
