from .SceneTextModel import SceneTextModel
from .SceneTextPrompter import SceneTextPrompter
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.User.UserModel import UserModel
from bson import ObjectId
from bson.errors import InvalidId
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from datetime import datetime
import uuid
from mongoengine.queryset.visitor import Q
from mongoengine import NotUniqueError
from main.modules.BeatSheet.BeatSheetService import BeatSheetService
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.ScriptText.ScriptTextService import ScriptTextService
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.UserPreference.UserPreferenceService import UserPreferenceService
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.libraries.Cache import Cache
from main.libraries.functions import decrypt_text, log_message

class SceneTextService:

    # Create an observable instance for the service
    events = Observable()

    @staticmethod
    def create_scene_text(project_id, user, title, text_seed=None, scene_order_after=None):
        """
        Create a new SceneTextModel object with a unique scene key.

        :param project_id: The ID of the project.
        :param user: The user creating the scene text.
        :param title: The title of the scene.
        :param text_seed: The seed text for the scene (optional).
        :param scene_order_after: The desired position of the scene in the ordering (optional).
        :return: The newly created SceneTextModel object.
        """
        # Create new SceneTextModel object
        scene_text = SceneTextModel(
            project_id=ObjectId(project_id),
            created_by=user,
            title=title,
            text_seed=text_seed,
            version_type='base',
            version_number=1,
            scene_key=uuid.uuid4(),
            created_at=datetime.utcnow()
        )

        if scene_order_after is not None:
            # Place the new scene after the specified scene order
            preceding_scene = SceneTextModel.objects(
                project_id=ObjectId(project_id),
                scene_order__lte=scene_order_after
            ).order_by('-scene_order').first()
            if preceding_scene:
                scene_order = preceding_scene.scene_order + 1
            else:
                scene_order = scene_order_after
            scene_text.scene_order = scene_order

            # Increment scene_order for subsequent scenes
            subsequent_scenes = SceneTextModel.objects(
                project_id=ObjectId(project_id),
                scene_order__gte=scene_order
            ).update(inc__scene_order=1)
        else:
            # Place the new scene at the end
            highest_order_scene = SceneTextModel.objects(
                project_id=ObjectId(project_id)
            ).order_by('-scene_order').first()
            scene_text.scene_order = (highest_order_scene.scene_order + 1) if highest_order_scene else 1

        scene_text.save()

        # Now initiate a new BeatSheet and script text for the created scene
        beat_sheet_id = BeatSheetService.init_beat_sheet(str(scene_text.scene_key), user, str(scene_text.id))
        script_text_id = ScriptTextService.init_script_text(str(scene_text.scene_key), user, str(scene_text.id))

        #refresh data
        scene_text = SceneTextModel.objects(id=scene_text.id).first()

        #trigger events
        SceneTextService.events.notify(Event('scene_created', {'scene_text': scene_text}))
        SceneTextService.clear_scene_text_cache(project_id)

        return scene_text

    @staticmethod
    def list_project_scenes(project_id):
        """
        Return a dictionary of the latest versions of scenes related to the project.

        :param project_id: The ID of the project.
        :return: A list of dictionaries containing scene details.
        """
        scenes = SceneTextModel.objects(project_id=ObjectId(project_id)).order_by('scene_order')
        unique_scenes = {}

        for scene in scenes:
            key = str(scene.scene_key)
            try:
                created_by_id = str(scene.created_by.id) if scene.created_by else None
            except Exception:
                # Log the issue and proceed with created_by as None
                #log_message('error', f"Error resolving created_by field for scene_key {key}")
                created_by_id = None

            if key not in unique_scenes:
                unique_scenes[key] = scene._to_dict()
            elif scene.version_number > unique_scenes[key]['version_number']:
                unique_scenes[key].update(scene._to_dict())

        #Sort scenes by their scene_order
        sorted_scenes = sorted(unique_scenes.values(), key=lambda x: x['scene_order'])
        return sorted_scenes

    @staticmethod
    def delete_scene(scene_key):
        """
        Delete all versions of a scene associated with the provided scene_key.
        Also delete any associated beat sheets.

        :param scene_key: The UUID key of the scene to delete.
        """
        try:
            if not isinstance(scene_key, uuid.UUID):
                scene_key = uuid.UUID(scene_key)

            get_scene = SceneTextModel.objects(scene_key=scene_key).first()
            if get_scene:
                project_id = str(get_scene.project_id.id)

                # Delete all beat sheet versions that match the scene_key
                BeatSheetModel.objects(scene_key=scene_key).delete()

                # Delete all script text versions that match the scene_key
                ScriptTextModel.objects(scene_key=scene_key).delete()

                # Delete all scene text versions that match the scene_key
                SceneTextModel.objects(scene_key=scene_key).delete()

                #trigger events -- since the scene is deleted the only data we can pass really is the scene_key
                SceneTextService.events.notify(Event('scene_deleted', {'scene_key': scene_key, 'project_id': project_id}))
                SceneTextService.clear_scene_text_cache(project_id)

        except (ValueError, InvalidId) as e:
            raise ValueError(f"Invalid scene key: {e}")

    @staticmethod
    def delete_all_scenes(project_id):
        """
        Delete all scenes associated with a project.
        Also delete any associated beat sheets by looping through each scene.

        :param project_id: The ID of the project whose scenes are to be deleted.
        """
        try:
            project_id_obj = ObjectId(project_id)
            # Find all unique scene keys within the project
            unique_scene_keys = SceneTextModel.objects(project_id=project_id_obj).distinct('scene_key')

            # Loop through each unique scene key and delete the corresponding scenes
            for scene_key in unique_scene_keys:
                SceneTextService.delete_scene(scene_key)

        except (InvalidId) as e:
            raise ValueError(f"Invalid project_id: {e}")

    @staticmethod
    def get_scene_text(text_id=None, scene_key=None, version_number=None):
        """
        Load a scene text by text ID or by scene key and optional version number.

        :param text_id: The ID of the scene text.
        :param scene_key: The UUID key of the scene.
        :param version_number: The specific version number to retrieve.
        :return: The requested SceneTextModel document.
        """
        try:
            if text_id:
                oid = ObjectId(text_id)
                return SceneTextModel.objects(id=oid).first()
            elif scene_key:
                if not isinstance(scene_key, uuid.UUID):
                    scene_key = uuid.UUID(scene_key)
                if version_number is not None:
                    return SceneTextModel.objects(scene_key=scene_key, version_number=version_number).first()
                else:
                    return SceneTextModel.objects(scene_key=scene_key).order_by('-version_number').first()
            else:
                raise ValueError("Either text_id or scene_key must be provided.")
        except (ValueError) as e:
            raise ValueError(f"Invalid identifier: {e}")

    @staticmethod
    def list_scene_versions(scene_key):
        """
        Retrieve a list of all scene text versions by scene key.

        :param scene_key: The unique key of the scene.
        :return: A list of scene text versions with selected fields, sorted by version number.
        """
        try:
            if not isinstance(scene_key, uuid.UUID):
                scene_key = uuid.UUID(scene_key)
            versions = SceneTextModel.objects(scene_key=scene_key).order_by('version_number')
            version_list = []
            for version in versions:
                try:
                    created_by_id = str(version.created_by.id) if version.created_by else None
                except Exception:
                    # Log the issue and proceed with created_by as None
                    #log_message('error', f"Error resolving created_by field for scene_key {key}")
                    created_by_id = None
                version_list.append({
                    'id': str(version.id),
                    'version_type': version.version_type,
                    'version_number': version.version_number,
                    'source_version_number': version.source_version.version_number if version.source_version else None,
                    'version_label': version.version_label,
                    'character_count': version.character_count,
                    'scene_key': version.scene_key,
                    'scene_order': version.scene_order,
                    'title': version.title,
                    'text_seed': version.text_seed,
                    'llm_model': version.llm_model,
                    'created_at': version.created_at,  # Format for readability
                    'created_by': created_by_id
                })
            return version_list
        except (ValueError) as e:
            raise ValueError(f"Invalid scene key: {e}")

    @staticmethod
    def create_new_version(source_text, user, version_type, title=None, text_seed=None, text_notes=None, text_content=None, llm_model=None):
        """
        Creates a new version of scene text based on the source text.

        :param source_text: The source SceneTextModel object to base the new version on.
        :param user: The user object who is creating the new version.
        :param version_type: The version type for the new version (e.g., 'edit', 'note', 'seed').
        :param text_seed: Optional seed text for the new version.
        :param text_notes: Optional notes for the new version.
        :param text_content: Optional content text for the new version.
        :return: The newly created SceneTextModel object.
        """
        # Determine the latest version number for the scene and increment it
        latest_version = SceneTextModel.objects(scene_key=source_text.scene_key).order_by('-version_number').first()
        next_version_number = latest_version.version_number + 1 if latest_version else 1

        # Create the new version
        new_scene_text = SceneTextModel(
            project_id=source_text.project_id,
            scene_key=source_text.scene_key,
            version_type=version_type,
            source_version=source_text,
            version_number=next_version_number,
            scene_order=source_text.scene_order,
            title=title if title is not None else source_text.title,
            text_seed=text_seed if text_seed is not None else source_text.text_seed,
            text_notes=text_notes if text_notes is not None else source_text.text_notes,
            text_content=text_content if text_content is not None else source_text.text_content,
            character_count=len(text_content) if text_content is not None else source_text.character_count,
            llm_model=llm_model if llm_model is not None else source_text.llm_model,
            created_by=user
        )
        new_scene_text.save()

        #refresh data
        new_scene_text = SceneTextModel.objects(id=new_scene_text.id).first()

        #trigger events
        SceneTextService.events.notify(Event('scene_text_new_version', {'scene_text': new_scene_text}))
        SceneTextService.clear_scene_text_cache(new_scene_text.project_id.id)

        return new_scene_text

    @staticmethod
    def rebase_scene_text(scene_text_id=None, scene_key=None, version_number=None):
        """
        Rebase to a selected scene text version, archiving all other versions.

        :param scene_text_id: The ID of the scene text to rebase to.
        :param scene_key: The unique key of the scene (used if scene_text_id is not provided).
        :param version_number: The version number to rebase to (used if scene_key is provided).
        """
        # Find the scene text to rebase to
        if scene_text_id:
            new_base = SceneTextModel.objects(id=scene_text_id).first()
        elif scene_key and version_number:
            new_base = SceneTextModel.objects(scene_key=scene_key, version_number=version_number).first()
        else:
            raise ValueError("Either scene_text_id or (scene_key and version_number) must be provided.")

        if not new_base:
            raise ValueError("Scene text to rebase to does not exist.")

        # Rebase the selected version
        new_base.version_type = 'base'
        new_base.version_number = 1  # Reset the version number to 1 for the new base
        new_base.source_version = None
        new_base.save()

        # Archive all other versions by deleting them
        SceneTextModel.objects(Q(scene_key=new_base.scene_key) & Q(id__ne=new_base.id)).delete()

        # Save the new base as the only version
        new_base.save()

        # Update the scene_order for the remaining scene text
        # This is not strictly needed for the rebasing process itself but ensures that
        # the scene_order is correct after the operation.
        if scene_key:
            scenes_to_update = SceneTextModel.objects(scene_key=scene_key)
            for index, scene in enumerate(scenes_to_update.order_by('created_at')):
                scene.update(scene_order=index + 1)

        #trigger events
        SceneTextService.events.notify(Event('scene_text_rebased', {'scene_text': new_base}))
        SceneTextService.clear_scene_text_cache(new_base.project_id.id)

        return True

    @staticmethod
    def update_version_label(scene_text_id=None, scene_key=None, version_number=None, version_label=''):
        """
        Updates the version label field without creating a new version.

        :param scene_text_id: The ID of the scene text to update the label.
        :param project_id: The ID of the project (used if scene_text_id is not provided).
        :param version_number: The version number to update the label (used if scene_text_id is not provided).
        :param version_label: The new version label.
        """
        # Find the scene text to update the label
        if scene_text_id:
            scene_text = SceneTextModel.objects(id=scene_text_id).first()
        elif scene_key and version_number:
            scene_text = SceneTextModel.objects(scene_key=scene_key, version_number=version_number).first()
        else:
            raise ValueError("Either scene_text_id or (scene_key and version_number) must be provided.")

        if not scene_text:
            raise ValueError("Scene text to update the label does not exist.")

        # Update the version label
        scene_text.version_label = version_label
        scene_text.save()

        #trigger events
        SceneTextService.events.notify(Event('scene_text_version_label', {'scene_text': scene_text}))
        SceneTextService.clear_scene_text_cache(scene_text.project_id.id)

        return True

    @staticmethod
    def reorder_scene(text_id, new_scene_order):
        if new_scene_order <= 0:
            raise ValueError("new_scene_order must be a positive integer.")

        scene_text = SceneTextModel.objects(id=text_id).first()
        if not scene_text:
            raise ValueError("Scene text not found.")

        max_order = SceneTextModel.objects(project_id=scene_text.project_id).count()
        new_scene_order = min(new_scene_order, max_order)  # Adjusted to ensure within valid range

        if scene_text.scene_order == new_scene_order:
            return  # No change needed

        original_order = scene_text.scene_order

        # Cases: Moving forward or backward
        if new_scene_order > original_order:
            # Moving forward
            SceneTextModel.objects(
                project_id=scene_text.project_id,
                scene_order__gt=original_order,
                scene_order__lte=new_scene_order
            ).update(dec__scene_order=1)
        else:
            # Moving backward
            SceneTextModel.objects(
                project_id=scene_text.project_id,
                scene_order__lt=original_order,
                scene_order__gte=new_scene_order
            ).update(inc__scene_order=1)

        # Update the scene_order of the moved scene
        scene_text.update(set__scene_order=new_scene_order)

        #trigger events
        SceneTextService.events.notify(Event('scene_reordered', {'scene_key': scene_text.scene_key, 'project_id': str(scene_text.project_id.id), 'new_order': new_scene_order}))
        SceneTextService.clear_scene_text_cache(str(scene_text.project_id.id))

        return scene_text


    @staticmethod
    def update_scene_text(text_id, user, title=None, text_seed=None, text_notes=None, text_content=None):
        """
        Update a scene text by creating a new version with updated fields.

        :param text_id: The ID of the source scene text to update from.
        :param user: The user object who is updating the scene text.
        :param title: Optional updated scene title.
        :param text_seed: Optional updated seed text.
        :param text_notes: Optional updated notes.
        :param text_content: Optional updated content text.
        :return: The newly created SceneTextModel document.
        """
        source_text = SceneTextModel.objects(id=text_id).first()
        if not source_text:
            raise ValueError("The source scene text does not exist.")

        # Use the create_new_version method to handle the creation of a new version
        new_scene_text = SceneTextService.create_new_version(
            source_text=source_text,
            user=user,
            version_type='edit',
            title=title,
            text_seed=text_seed,
            text_notes=text_notes,
            text_content=text_content
        )
        return new_scene_text

    @staticmethod
    def generate_from_seed(project_id, text_id, text_seed=None, user_id=None):
        # Load the scene text object
        scene_text = SceneTextModel.objects(id=text_id).first()
        if not scene_text:
            raise ValueError("The scene text does not exist.")
        if str(scene_text.project_id.id) != str(project_id):
            raise ValueError("Scene text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = SceneTextPrompter.prompt_from_seed(scene_text, text_seed, default_llm)

        if text_seed:
            use_seed_text = text_seed
        else:
            use_seed_text = scene_text.text_seed

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'new',
            'text_seed': use_seed_text
        }

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'SceneText', scene_text.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def generate_with_notes(project_id, text_id, text_notes=None, user_id=None, select_text_start=None, select_text_end=None):
        # Load the scene text object
        scene_text = SceneTextModel.objects(id=text_id).first()
        if not scene_text:
            raise ValueError("The scene text does not exist.")
        if str(scene_text.project_id.id) != str(project_id):
            raise ValueError("Scene text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = SceneTextPrompter.prompt_with_notes(scene_text, text_notes, default_llm, select_text_start, select_text_end)

        if text_notes:
            use_notes_text = text_notes
        else:
            use_notes_text = scene_text.text_notes

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'note',
            'text_notes': use_notes_text,
            'selective': False
        }

        if select_text_start or select_text_end:
            task_metadata['selective'] = True
            task_metadata['select_text_start'] = select_text_start
            task_metadata['select_text_end'] = select_text_end

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'SceneText', scene_text.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def generate_make_scenes(project_id, story_text_id, scene_count=24, user_id=None):
        # Load the story text object
        story_text = StoryTextModel.objects(id=story_text_id).first()
        if not story_text:
            raise ValueError("The story text does not exist.")
        if str(story_text.project_id.id) != str(project_id):
            raise ValueError("Story text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = SceneTextPrompter.prompt_make_scenes(story_text, scene_count, default_llm)

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'story_text_id': story_text_id,
            'scene_count': scene_count
        }

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'MakeScenes', project_id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def clear_scene_text_cache(project_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'project_scenes_project_id:{project_id}')
        tags_to_clear.append(f'scene_text_versions_project_id:{project_id}')
        tags_to_clear.append(f'scene_text_project_id:{project_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
