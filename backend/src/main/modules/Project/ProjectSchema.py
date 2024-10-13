"""
Project Schema

This file defines the Project GraphQL object type and all queries and mutations associated with a Project.
"""

from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from graphene.types.generic import GenericScalar
from .ProjectService import ProjectService
from graphql import GraphQLError
import datetime
from main.libraries.decorators import project_role, cache_response
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel

class ProjectMetadataInput(InputObjectType):
    age_rating = String()
    genre = String()
    audiences = String()
    target_length = String()
    guidance = String()
    budget = String()
    apply_profile_when_generating = GenericScalar()  # To store the true/false toggles

# Define the Project ObjectType
class Project(ObjectType):
    id = ID(required=True)
    title = String(required=True)
    created_at = DateTime()
    updated_at = DateTime()
    archived = Boolean()
    metadata = GenericScalar()
    members = GenericScalar()
    latest_story_text_id = String()

    # Define resolvers for querying project data
    @classmethod
    @cache_response("projects_", "show_archived")
    def resolve_projects(cls, info, show_archived):
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')
        try:
            projects = ProjectService.list_projects(user, show_archived)
            return [project._to_dict() for project in projects]
        except Exception as e:
            raise GraphQLError(str(e))

    @classmethod
    @cache_response("project_", "id")
    def resolve_project_by_id(cls, info, id):
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        try:
            project = ProjectService.get_project_details(user, id)
            return project._to_dict()
        except Exception as e:
            raise GraphQLError(str(e))

class CollateProject(ObjectType):
    text = String(required=True)

    @classmethod
    def collate_project(cls, info, project_id, detailed,
                        include_story_title,
                        include_story_text,
                        include_scene_number,
                        include_scene_title,
                        include_scene_hint,
                        include_scene_text,
                        include_scene_script):
        collate_output = []
        project = ProjectModel.objects(id=project_id).first()

        if include_story_title:
            collate_output.append(project.title)

        if include_story_text:
            story_text_model = StoryTextModel.objects(project_id=project_id).order_by("-version_number").first()
            collate_output.append(story_text_model.text_content)

        scene_texts = SceneTextModel.objects(project_id=project_id,
                                             ).order_by("-version_number").all()
        processed_scenes = set()
        for scene_text in scene_texts:

            if scene_text.scene_key in processed_scenes:
                continue
            script_text = ScriptTextModel.objects(scene_key=scene_text.scene_key,
                                                 scene_text_id=scene_text.id,
                                                  ).order_by("-version_number").first()

            if include_scene_title and scene_text and scene_text.title:
                if include_scene_number:
                    collate_output.append(f"{scene_text.scene_order}. {scene_text.title}")
                else:
                    collate_output.append(scene_text.title)

            if not detailed:
                priority = [
                        scene_text.text_seed,
                        scene_text.text_content,
                        script_text.text_content,
                ]
                priority = [s for s in priority if s is not None]
                collate_output.append(priority[-1])
                continue

            if include_scene_hint and scene_text and scene_text.text_seed:
                collate_output.append(scene_text.text_seed)
            if include_scene_text and scene_text and scene_text.text_content:
                collate_output.append(scene_text.text_content)
            if include_scene_script and script_text and script_text.text_content:
                collate_output.append(script_text.text_content)

        return CollateProject(text="\n\n".join(collate_output))

# Define the CreateProject Mutation
class CreateProject(Mutation):
    class Arguments:
        title = String(required=True)
        metadata = ProjectMetadataInput()
        text_seed = String()

    project = Field(Project)

    def mutate(self, info, title, metadata=None, text_seed=None):
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        try:
            project = ProjectService.create_project(user, title, metadata, text_seed)
            return CreateProject(project=project._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Define the UpdateProject Mutation
class UpdateProject(Mutation):
    class Arguments:
        project_id = ID(required=True)
        title = String()
        metadata = ProjectMetadataInput()

    project = Field(Project)

    @project_role(roles="owner")
    def mutate(self, info, project_id, title, metadata=None):
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        try:
            project = ProjectService.update_project(user, project_id, title, metadata)
            return UpdateProject(project=project._to_dict())
        except Exception as e:
            raise GraphQLError(str(e))

# Define the ArchiveProject Mutation
class ArchiveProject(Mutation):
    class Arguments:
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id):
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        try:
            ProjectService.archive_project(user, project_id)
            return ArchiveProject(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

# Define the RestoreProject Mutation
class RestoreProject(Mutation):
    class Arguments:
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id):
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        try:
            ProjectService.restore_project(user, project_id)
            return RestoreProject(success=True)
        except Exception as e:
            raise GraphQLError(str(e))

# Define the CloneProject Mutation
class CloneProject(Mutation):
    class Arguments:
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id):
        user = info.context.get('user')
        if not user:
            raise GraphQLError('Not authorized')

        try:
            result = ProjectService.clone_project(user, project_id)
            return RestoreProject(success=result)
        except Exception as e:
            raise GraphQLError(str(e))


def get_query_fields():
    return {
        'projects': List(
            Project,
            show_archived=Boolean(default_value=False),
            resolver=lambda self, info, **args: Project.resolve_projects(info, **args)
        ),
        'project_by_id': Field(
            Project,
            id=ID(required=True),
            resolver=lambda self, info, **args: Project.resolve_project_by_id(info, **args)
        ),
        'collate_project': Field(
            CollateProject,
            project_id=ID(required=True),
            detailed=Boolean(default_value=False),
            include_story_title=Boolean(default_value=False),
            include_story_text=Boolean(default_value=False),
            include_scene_number=Boolean(default_value=False),
            include_scene_title=Boolean(default_value=False),
            include_scene_hint=Boolean(default_value=False),
            include_scene_text=Boolean(default_value=False),
            include_scene_script=Boolean(default_value=False),
            resolver=lambda self, info, **args: CollateProject.collate_project(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'create_project': CreateProject.Field(),
        'update_project': UpdateProject.Field(),
        'archive_project': ArchiveProject.Field(),
        'restore_project': RestoreProject.Field(),
        'clone_project': CloneProject.Field(),
    }
