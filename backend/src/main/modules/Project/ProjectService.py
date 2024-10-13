from .ProjectModel import ProjectModel, ProjectRole
from mongoengine.queryset.visitor import Q
from mongoengine.connection import get_connection, get_db
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.libraries.Cache import Cache
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.SceneText.SceneTextService import SceneTextService
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.BeatSheet.BeatSheetService import BeatSheetService
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.ScriptText.ScriptTextService import ScriptTextService
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleModel import SuggestedStoryTitleModel
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleService import SuggestedStoryTitleService
from main.libraries.functions import decrypt_text
from main.libraries.functions import log_message

class ProjectService:

    # Create an observable instance for the service
    project_events = Observable()

    @staticmethod
    def list_projects(user, show_archived=False):
        query = Q(members__match={'user': user})
        if not show_archived:
            query &= Q(archived=False)

        # Return projects that the user is a member of and match the archived filter
        return ProjectModel.objects(query)

    @staticmethod
    def get_project_details(user, project_id):
        project = ProjectModel.objects(id=project_id, members__user=user).first()
        if project:
            return project
        else:
            raise ValueError("Project not found or access denied.")

    @staticmethod
    def create_project(user, title, metadata=None, text_seed=None):
        # Initialize the apply_profile_when_generating dictionary with default values
        apply_profile_defaults = {
            'StoryText': True,
            'SceneText': True,
            'MakeScenes': True,
            'SuggestedStoryTitle': True,
            'ScriptText': True,
            'BeatSheet': True,
            'Character': True,
            'Location': True
        }

        project_metadata = {}
        if metadata:
            # Update apply_profile_when_generating with provided values if any
            if metadata and 'apply_profile_when_generating' in metadata:
                apply_profile_defaults.update(metadata['apply_profile_when_generating'])

            # Set the new metadata including apply_profile_when_generating
            project_metadata = {
                'age_rating': metadata.get('age_rating', ''),
                'genre': metadata.get('genre', ''),
                'audiences': metadata.get('audiences', ''),
                'target_length': metadata.get('target_length', ''),
                'guidance': metadata.get('guidance', ''),
                'budget': metadata.get('budget', ''),
                'apply_profile_when_generating': apply_profile_defaults
            }

        project = ProjectModel(title=title, metadata=project_metadata or {})
        project.members = [ProjectRole(user=user, role='owner')]
        project.save()

        # Re-fetch the project to ensure post_init signal triggers decryption
        project = ProjectModel.objects(id=project.id).first()

        # Initialize Story Text for the project
        story_text_id = StoryTextService.init_story_text(project.id, user, text_seed)

        #trigger events
        ProjectService.project_events.notify(Event('project_created', {'project': project}))
        ProjectService.clear_project_cache(project.id)

        return project

    @staticmethod
    def update_project(user, project_id, title, metadata):
        project = ProjectModel.objects(id=project_id, members__user=user, members__role='owner').first()
        if project:
            project.title = title
            if metadata:
                # Update the metadata fields
                for key, value in metadata.items():
                    if key == 'apply_profile_when_generating':
                        # Ensure existing togglesare preserved if not specified
                        project.metadata[key].update(value)
                    else:
                        project.metadata[key] = value
            project.save()

            #trigger events
            ProjectService.project_events.notify(Event('project_updated', {'project': project}))
            ProjectService.clear_project_cache(project_id)

            #refresh data
            project = ProjectModel.objects(id=project.id).first()

            return project
        else:
            raise ValueError("Project not found or insufficient permissions.")

    @staticmethod
    def archive_project(user, project_id):
        project = ProjectModel.objects(id=project_id, members__user=user, members__role='owner').first()
        if project:
            project.archived = True
            project.save()

            #trigger events
            ProjectService.project_events.notify(Event('project_archived', {'project': project}))
            ProjectService.clear_project_cache(project_id)

            return project
        else:
            raise ValueError("Project not found or insufficient permissions.")

    @staticmethod
    def restore_project(user, project_id):
        project = ProjectModel.objects(id=project_id, members__user=user, members__role='owner').first()
        if project:
            project.archived = False
            project.save()

            #trigger events
            ProjectService.project_events.notify(Event('project_restored', {'project': project}))
            ProjectService.clear_project_cache(project_id)

            return project
        else:
            raise ValueError("Project not found or insufficient permissions.")

    @staticmethod
    def clone_project(user, project_id):

        created = []

        def abort_clone():
            for c in created:
                try:
                    c.delete()
                except Exception:
                    continue

        objs = {
            "projects": ProjectModel,
            "story_texts": StoryTextModel,
            "scene_texts": SceneTextModel,
            "beat_sheets": BeatSheetModel,    # references scene_texts
            "script_texts": ScriptTextModel,  # so must come after
            "suggested_story_titles": SuggestedStoryTitleModel,
        }

        scene_text_id = None

        for key, model in objs.items():
            try:
                args = {}
                match key:
                    case "projects":
                        args.update({
                            "id": project_id,
                            "members__user": user,
                            "members__role": "owner",
                        })
                    case "beat_sheets":
                        args.update({"scene_text_id": scene_text_id})
                    case "script_texts":
                        args.update({"scene_text_id": scene_text_id})
                    case _:
                        args.update({"project_id": project_id})

                results = model.objects(**args).all()

                for r in results:
                    attrs = r.to_mongo()
                    del attrs["_id"]
                    if key == "projects":
                        attrs["title"] = f"{attrs['title']} (copy)"
                    cloned = model(**attrs)
                    cloned.save()
                    if key == "scene_texts":
                        scene_text_id = cloned.id
                    created.append(cloned)

            except Exception as e:
                log_message('error', f"failed to clone {key}: {e}")
                abort_clone()
                return False

        return True

    @staticmethod
    def clear_project_cache(project_id):
        project = ProjectModel.objects(id=project_id).first()
        if not project:
            raise ValueError("Project not found, unable to clear cache.")

        # Construct tags for invalidation
        tags_to_clear = []

        # Tag for all project cache entries related to this project_id
        tags_to_clear.append(f"project_id:{project_id}")

        # Loop through the project members to clear user-specific project cache entries
        for member in project.members:
            user_id = str(member.user.id)
            tags_to_clear.append(f"projects_{user_id}")

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
