from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType, UUID
from graphene.types.generic import GenericScalar
from .ScriptTextService import ScriptTextService
from graphql import GraphQLError
from datetime import datetime
from main.libraries.decorators import project_role, cache_response


# Define the ScriptText ObjectType
class ScriptText(ObjectType):
    id = ID(required=True)
    scene_key = ID(required=True)
    version_type = String(required=True)
    source_version_number = Int()
    version_number = Int(required=True)
    version_label = String()
    scene_text_id = ID()  # Add this line for the scene_text_id
    text_notes = String()
    text_content = String()
    text_content_formatted = String()
    character_count = Int()
    llm_model = String()
    created_at = DateTime()
    created_by = ID()

    @classmethod
    @project_role(roles=None)
    @cache_response('script_text_', 'text_id', 'scene_key', 'version_number', 'project_id')
    def resolve_script_text(cls, info, **kwargs):
        try:
            text_id = kwargs.get('text_id')
            scene_key = kwargs.get('scene_key')
            version_number = kwargs.get('version_number')
            project_id = kwargs.get('project_id')  # Required for permissions check

            script_text = ScriptTextService.get_script_text(text_id, scene_key, version_number)
            if not script_text:
                raise GraphQLError('Script text not found')


            return script_text._to_dict()
        except Exception as e:
            raise GraphQLError(f'Error retrieving script text: {str(e)}')

    @classmethod
    @project_role(roles=None)
    @cache_response('script_text_versions_', 'scene_key', 'project_id')
    def resolve_script_text_versions(cls, info, **kwargs):
        try:
            scene_key = kwargs.get('scene_key')
            project_id = kwargs.get('project_id')  # Required for permissions check

            versions = ScriptTextService.list_script_text_versions(scene_key)
            return versions
        except Exception as e:
            raise GraphQLError(str(e))

class RebaseScriptText(Mutation):
    class Arguments:
        script_text_id = ID()
        scene_key = ID(required=True)
        version_number = Int()
        # project_id is kept for permissions check
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, project_id, script_text_id=None, version_number=None):
        try:
            ScriptTextService.rebase_script_text(script_text_id, scene_key, version_number)
            return RebaseScriptText(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateScriptTextVersionLabel(Mutation):
    class Arguments:
        script_text_id = ID()
        scene_key = ID(required=True)
        version_number = Int()
        version_label = String(required=True)
        # project_id is kept for permissions check
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, project_id, version_label, script_text_id=None, version_number=None):
        try:
            ScriptTextService.update_version_label(script_text_id, scene_key, version_number, version_label)
            return UpdateScriptTextVersionLabel(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateScriptText(Mutation):
    class Arguments:
        scene_text_id = ID(required=True)
        text_id = ID(required=True)
        text_notes = String()
        text_content = String()
        # project_id is kept for permissions check
        project_id = ID(required=True)

    script_text = Field(ScriptText)

    @project_role(roles="owner")
    def mutate(self, info, scene_text_id, text_id, project_id, text_notes=None, text_content=None):
        user = info.context.get('user')
        try:
            updated_script_text = ScriptTextService.update_script_text(text_id, user, scene_text_id, text_notes, text_content)
            return UpdateScriptText(script_text=updated_script_text._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating script text from scene
class GenerateScriptTextFromScene(Mutation):
    class Arguments:
        scene_key = ID(required=True)
        text_id = ID(required=True)
        scene_text_id = ID(required=True)
        project_id = ID(required=True)
        include_beat_sheet = Boolean()
        author_style_id = ID()
        style_guideline_id = ID()
        script_dialog_flavor_id = ID()
        screenplay_format = Boolean()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, text_id, scene_text_id, project_id, include_beat_sheet=True, author_style_id=None, style_guideline_id=None, script_dialog_flavor_id=None, screenplay_format=False):
        user = info.context.get('user')
        try:
            agent_task_id = ScriptTextService.generate_from_scene(
                scene_key, text_id, scene_text_id, user.id, include_beat_sheet, author_style_id, style_guideline_id, script_dialog_flavor_id, screenplay_format
            )
            return GenerateScriptTextFromScene(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating script text with notes
class GenerateScriptTextWithNotes(Mutation):
    class Arguments:
        scene_key = ID(required=True)
        text_id = ID(required=True)
        text_notes = String()
        project_id = ID(required=True)
        include_beat_sheet = Boolean()
        author_style_id = ID()
        style_guideline_id = ID()
        script_dialog_flavor_id = ID()
        screenplay_format = Boolean()
        select_text_start = Int()
        select_text_end = Int()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, text_id, text_notes, project_id, include_beat_sheet=True, author_style_id=None, style_guideline_id=None, script_dialog_flavor_id=None, screenplay_format=False, select_text_start=None, select_text_end=None):
        user = info.context.get('user')
        try:
            agent_task_id = ScriptTextService.generate_with_notes(
                scene_key, text_id, text_notes, user.id, include_beat_sheet, author_style_id, style_guideline_id, script_dialog_flavor_id, screenplay_format, select_text_start, select_text_end
            )
            return GenerateScriptTextWithNotes(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating both a beat sheet AND script text from scene. Makes beat sheet first, triggers script text after
class GenerateScriptAndBeatSheet(Mutation):
    class Arguments:
        scene_key = ID(required=True)
        scene_text_id = ID(required=True)
        project_id = ID(required=True)
        author_style_id = ID()
        style_guideline_id = ID()
        script_dialog_flavor_id = ID()
        screenplay_format = Boolean()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, scene_text_id, project_id, author_style_id=None, style_guideline_id=None, script_dialog_flavor_id=None, screenplay_format=False):
        user = info.context.get('user')
        try:
            agent_task_id = ScriptTextService.generate_script_and_beat_sheet(
                scene_key, scene_text_id, user.id, author_style_id, style_guideline_id, script_dialog_flavor_id, screenplay_format
            )
            return GenerateScriptAndBeatSheet(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

def get_query_fields():
    return {
        'get_script_text': Field(
            ScriptText,
            text_id=ID(),
            scene_key=UUID(),
            version_number=Int(),
            project_id=ID(required=True),  # project_id is kept for permissions check
            formatted=Boolean(default_value=False),
            resolver=lambda self, info, **args: ScriptText.resolve_script_text(info, **args)
        ),
        'list_script_text_versions': List(
            ScriptText,
            scene_key=ID(required=True),  # Changed from project_id to scene_key
            project_id=ID(required=True),  # project_id is kept for permissions check
            resolver=lambda self, info, **args: ScriptText.resolve_script_text_versions(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'rebase_script_text': RebaseScriptText.Field(),
        'update_script_text_version_label': UpdateScriptTextVersionLabel.Field(),
        'update_script_text': UpdateScriptText.Field(),
        'generate_script_text_from_scene': GenerateScriptTextFromScene.Field(),
        'generate_script_text_with_notes': GenerateScriptTextWithNotes.Field(),
        'generate_script_and_beat_sheet': GenerateScriptAndBeatSheet.Field()
    }
