from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType, UUID
from graphene.types.generic import GenericScalar
from .BeatSheetService import BeatSheetService
from graphql import GraphQLError
from datetime import datetime
from main.libraries.decorators import project_role, cache_response

# Define the BeatSheet ObjectType
class BeatSheet(ObjectType):
    id = ID(required=True)
    scene_key = ID(required=True)
    version_type = String(required=True)
    source_version_number = Int()
    version_number = Int(required=True)
    version_label = String()
    scene_text_id = ID()  # Add this line for the scene_text_id
    text_notes = String()
    text_content = String()
    character_count = Int()
    llm_model = String()
    created_at = DateTime()
    created_by = ID()

    @classmethod
    @project_role(roles=None)
    @cache_response('beat_sheet_', 'text_id', 'scene_key', 'version_number', 'project_id')
    def resolve_beat_sheet(cls, info, **kwargs):
        try:
            text_id = kwargs.get('text_id')
            scene_key = kwargs.get('scene_key')
            version_number = kwargs.get('version_number')
            project_id = kwargs.get('project_id')  # Required for permissions check

            beat_sheet = BeatSheetService.get_beat_sheet(text_id, scene_key, version_number)
            if not beat_sheet:
                raise GraphQLError('Beat sheet not found')

            return beat_sheet._to_dict()
        except Exception as e:
            raise GraphQLError(f'Error retrieving beat sheet: {str(e)}')

    @classmethod
    @project_role(roles=None)
    @cache_response('beat_sheet_versions_', 'scene_key', 'project_id')
    def resolve_beat_sheet_versions(cls, info, **kwargs):
        try:
            scene_key = kwargs.get('scene_key')
            project_id = kwargs.get('project_id')  # Required for permissions check

            versions = BeatSheetService.list_beat_sheet_versions(scene_key)
            return versions
        except Exception as e:
            raise GraphQLError(str(e))

class RebaseBeatSheet(Mutation):
    class Arguments:
        beat_sheet_id = ID()
        scene_key = ID(required=True)
        version_number = Int()
        # project_id is kept for permissions check
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, project_id, beat_sheet_id=None, version_number=None):
        try:
            BeatSheetService.rebase_beat_sheet(beat_sheet_id, scene_key, version_number)
            return RebaseBeatSheet(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateBeatSheetVersionLabel(Mutation):
    class Arguments:
        beat_sheet_id = ID()
        scene_key = ID(required=True)
        version_number = Int()
        version_label = String(required=True)
        # project_id is kept for permissions check
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, project_id, version_label, beat_sheet_id=None, version_number=None):
        try:
            BeatSheetService.update_version_label(beat_sheet_id, scene_key, version_number, version_label)
            return UpdateBeatSheetVersionLabel(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

class UpdateBeatSheet(Mutation):
    class Arguments:
        scene_text_id = ID(required=True)
        text_id = ID(required=True)
        text_notes = String()
        text_content = String()
        # project_id is kept for permissions check
        project_id = ID(required=True)

    beat_sheet = Field(BeatSheet)

    @project_role(roles="owner")
    def mutate(self, info, scene_text_id, text_id, project_id, text_notes=None, text_content=None):
        user = info.context.get('user')
        try:
            updated_beat_sheet = BeatSheetService.update_beat_sheet(text_id, user, scene_text_id, text_notes, text_content)
            return UpdateBeatSheet(beat_sheet=updated_beat_sheet._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating beat sheet from scene
class GenerateBeatSheetFromScene(Mutation):
    class Arguments:
        scene_key = ID(required=True)
        text_id = ID(required=True)
        scene_text_id = ID(required=True)
        # project_id is kept for permissions check
        project_id = ID(required=True)
        author_style_id = ID()
        style_guideline_id = ID()
        script_dialog_flavor_id = ID()
        screenplay_format = Boolean()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, text_id, scene_text_id, project_id, author_style_id=None, style_guideline_id=None, script_dialog_flavor_id=None, screenplay_format=False):
        user = info.context.get('user')
        try:
            agent_task_id = BeatSheetService.generate_from_scene(
                scene_key, text_id, scene_text_id, user.id, author_style_id, style_guideline_id, script_dialog_flavor_id, screenplay_format
            )
            return GenerateBeatSheetFromScene(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

# Mutation for generating beat sheet with notes
class GenerateBeatSheetWithNotes(Mutation):
    class Arguments:
        scene_key = ID(required=True)
        text_id = ID(required=True)
        text_notes = String()
        # project_id is kept for permissions check
        project_id = ID(required=True)
        author_style_id = ID()
        style_guideline_id = ID()
        script_dialog_flavor_id = ID()
        screenplay_format = Boolean()
        select_text_start = Int()
        select_text_end = Int()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, scene_key, text_id, text_notes, project_id, author_style_id=None, style_guideline_id=None, script_dialog_flavor_id=None, screenplay_format=False, select_text_start=None, select_text_end=None):
        user = info.context.get('user')
        try:
            agent_task_id = BeatSheetService.generate_with_notes(
                scene_key, text_id, text_notes, user.id, author_style_id, style_guideline_id, script_dialog_flavor_id, screenplay_format, select_text_start, select_text_end
            )
            return GenerateBeatSheetWithNotes(agent_task_id=agent_task_id)
        except Exception as e:
            raise GraphQLError(str(e))

def get_query_fields():
    return {
        'get_beat_sheet': Field(
            BeatSheet,
            text_id=ID(required=True),  # Make sure this is marked as required
            scene_key=UUID(required=True),  # Added scene_key as a required argument
            version_number=Int(),
            project_id=ID(),  # project_id is not required here but kept for permissions check
            resolver=lambda self, info, **args: BeatSheet.resolve_beat_sheet(info, **args)
        ),
        'list_beat_sheet_versions': List(
            BeatSheet,
            scene_key=ID(required=True),  # Changed from project_id to scene_key
            project_id=ID(required=True),  # project_id is kept for permissions check
            resolver=lambda self, info, **args: BeatSheet.resolve_beat_sheet_versions(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'rebase_beat_sheet': RebaseBeatSheet.Field(),
        'update_beat_sheet_version_label': UpdateBeatSheetVersionLabel.Field(),
        'update_beat_sheet': UpdateBeatSheet.Field(),
        'generate_beat_sheet_from_scene': GenerateBeatSheetFromScene.Field(),
        'generate_beat_sheet_with_notes': GenerateBeatSheetWithNotes.Field()
    }
