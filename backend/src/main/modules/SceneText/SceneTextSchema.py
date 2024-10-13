from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from graphene.types.generic import GenericScalar
from .SceneTextService import SceneTextService
from graphql import GraphQLError
from datetime import datetime
from main.libraries.decorators import project_role, cache_response

# Define the SceneText ObjectType
class SceneText(ObjectType):
    id = ID(required=True)
    project_id = ID(required=True)
    scene_key = String(required=True)
    scene_order = Int()
    title = String(required=True)
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
    latest_beat_sheet_id = String()
    latest_script_text_id = String()

    @classmethod
    @project_role(roles=None)
    @cache_response('project_scenes_', 'project_id')
    def resolve_list_project_scenes(cls, info, project_id):
        try:
            scenes = SceneTextService.list_project_scenes(project_id)
            return scenes
        except Exception as e:
            raise GraphQLError(str(e))

    @classmethod
    @project_role(roles=None)
    @cache_response('scene_text_', 'project_id', 'text_id', 'scene_key', 'version_number')
    def resolve_scene_text(cls, info, **kwargs):
        try:
            # Extract arguments with .get() to allow for None values if they are not present
            text_id = kwargs.get('text_id')
            scene_key = kwargs.get('scene_key')
            version_number = kwargs.get('version_number')
            project_id = kwargs.get('project_id')

            # Call the service method with the extracted parameters
            scene_text = SceneTextService.get_scene_text(text_id, scene_key, version_number)
            if not scene_text:
                raise GraphQLError('Scene text not found')

            # Convert the scene_text to a dictionary using the method from the ObjectType
            return scene_text._to_dict()
        except Exception as e:
            raise GraphQLError(f'Error retrieving scene text: {str(e)}')

    @classmethod
    @project_role(roles=None)
    @cache_response('scene_text_versions_', 'project_id', 'scene_key')
    def resolve_scene_versions(cls, info, project_id, scene_key):
        try:
            # Directly return the list of dictionaries from the service
            versions = SceneTextService.list_scene_versions(scene_key)
            return versions
        except Exception as e:
            raise GraphQLError(str(e))

class CreateSceneText(Mutation):
    class Arguments:
        project_id = ID(required=True)
        title = String(required=True)
        text_seed = String()
        scene_order_after = Int()

    scene_text = Field(SceneText)

    @project_role(roles="owner")
    def mutate(self, info, project_id, title, text_seed=None, scene_order_after=None):
        user = info.context.get('user')
        try:
            new_scene_text = SceneTextService.create_scene_text(
                project_id, user, title, text_seed, scene_order_after
            )
            return CreateSceneText(scene_text=new_scene_text._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

class DeleteSceneByKey(Mutation):
    class Arguments:
        project_id = ID(required=True)
        scene_key = String(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, scene_key):
        try:
            SceneTextService.delete_scene(scene_key)
            return DeleteSceneByKey(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutations
class RebaseSceneText(Mutation):
    class Arguments:
        project_id = ID(required=True)
        scene_key = String()
        scene_text_id = ID()
        version_number = Int()

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, scene_key=None, scene_text_id=None, version_number=None):
        try:
            SceneTextService.rebase_scene_text(scene_text_id, scene_key, version_number)
            return RebaseSceneText(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateSceneVersionLabel(Mutation):
    class Arguments:
        project_id = ID(required=True)
        scene_key = String()
        scene_text_id = ID()
        version_number = Int()
        version_label = String(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, version_label, scene_key=None, scene_text_id=None, version_number=None):
        try:
            SceneTextService.update_version_label(scene_text_id, scene_key, version_number, version_label)
            return UpdateSceneVersionLabel(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class ReorderScene(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        new_scene_order = Int(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id,  text_id, new_scene_order):
        try:
            SceneTextService.reorder_scene(text_id, new_scene_order)
            return ReorderScene(success=True)
        except ValueError as e:
            raise GraphQLError(str(e))
        except Exception as e:
            raise GraphQLError(f"Unexpected error occurred: {str(e)}")

class UpdateSceneText(Mutation):
    class Arguments:
        project_id = ID(required=True)
        text_id = ID(required=True)
        title = String()
        text_seed = String()
        text_notes = String()
        text_content = String()

    scene_text = Field(SceneText)

    @project_role(roles="owner")
    def mutate(self, info, project_id, text_id, title=None, text_seed=None, text_notes=None, text_content=None):
        user = info.context.get('user')
        try:
            updated_scene_text = SceneTextService.update_scene_text(text_id, user, title, text_seed, text_notes, text_content)
            return UpdateSceneText(scene_text=updated_scene_text._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating scene text from seed
class GenerateSceneFromSeed(Mutation):
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
            agent_task_id = SceneTextService.generate_from_seed(
                project_id, text_id, text_seed, user.id
            )
            return GenerateSceneFromSeed(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating scene text with notes
class GenerateSceneWithNotes(Mutation):
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
            agent_task_id = SceneTextService.generate_with_notes(
                project_id, text_id, text_notes, user.id, select_text_start, select_text_end
            )

            return GenerateSceneWithNotes(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for making a list of scenes from story text
class GenerateMakeScenes(Mutation):
    class Arguments:
        project_id = ID(required=True)
        story_text_id = ID(required=True)
        scene_count = Int()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, project_id, story_text_id, scene_count=24):
        user = info.context.get('user')
        try:
            # Call the generate_make_scenes method and pass the user ID
            agent_task_id = SceneTextService.generate_make_scenes(
                project_id, story_text_id, scene_count, user.id
            )

            return GenerateMakeScenes(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

def get_query_fields():
    return {
        'list_project_scenes': List(
            SceneText,
            project_id=ID(required=True),
            resolver=lambda self, info, **args: SceneText.resolve_list_project_scenes(info, **args)
        ),
        'get_scene_text': Field(
            SceneText,
            text_id=ID(),
            project_id=ID(required=True),
            scene_key=String(),
            version_number=Int(),
            resolver=lambda self, info, **args: SceneText.resolve_scene_text(info, **args)
        ),
        'list_scene_versions': List(
            SceneText,
            project_id=ID(required=True),
            scene_key=String(required=True),
            resolver=lambda self, info, **args: SceneText.resolve_scene_versions(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'create_scene_text': CreateSceneText.Field(),
        'reorder_scene': ReorderScene.Field(),
        'delete_scene_by_key': DeleteSceneByKey.Field(),
        'rebase_scene_text': RebaseSceneText.Field(),
        'update_scene_version_label': UpdateSceneVersionLabel.Field(),
        'update_scene_text': UpdateSceneText.Field(),
        'generate_scene_from_seed': GenerateSceneFromSeed.Field(),
        'generate_scene_with_notes': GenerateSceneWithNotes.Field(),
        'generate_make_scenes': GenerateMakeScenes.Field()

    }
