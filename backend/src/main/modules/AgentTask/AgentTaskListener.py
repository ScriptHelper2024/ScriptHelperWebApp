from .AgentTaskService import AgentTaskService
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextService import SceneTextService
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.BeatSheet.BeatSheetService import BeatSheetService
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.ScriptText.ScriptTextService import ScriptTextService
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleService import SuggestedStoryTitleService
from main.modules.CharacterProfile.CharacterProfileService import CharacterProfileService
from main.modules.CharacterProfile.CharacterProfileModel import CharacterProfileModel
from main.libraries.functions import extract_and_parse_json, replace_text_segment
from main.libraries.Websocket import Websocket
from main.libraries.functions import log_message

class AgentTaskListener:

    @staticmethod
    def broadcast(task):
        # Format the details of the agent task for the WebSocket notification
        websocket_data = {
            'type': 'agent_task',
            'agent_task_id': str(task.id),
            'status': task.status,
            'document_id': str(task.document_id),
            'document_type': task.document_type
        }

        # The channel to broadcast on should be 'project-<project ID>'
        channel_name = f"project-{task.project_id.id}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

    @staticmethod
    def agent_task_created_listener(event):
        task = event.data['task']
        AgentTaskListener.broadcast(task)
        return

    @staticmethod
    def agent_task_updated_listener(event):
        task = event.data['task']

        if task.status == 'completed':
            document_id = task.document_id
            document_type = task.document_type

            # Determine the service class and model class to use based on document_type
            if document_type == 'StoryText':
                # Load the source text document
                source_text = StoryTextModel.objects(id=document_id).first()
                if not source_text:
                    return

                # Load the user who initiated the request
                user_id = task.metadata.get('created_by')
                user = UserModel.objects(id=user_id).first()
                if not user:
                    return #must be a user ID related

                version_type = task.metadata.get('new_version_type', 'generation')
                is_selective = task.metadata.get('selective', False)
                select_text_start = task.metadata.get('select_text_start', None)
                select_text_end = task.metadata.get('select_text_end', None)

                text_seed = task.metadata.get('text_seed', source_text.text_seed)
                text_notes = task.metadata.get('text_notes', source_text.text_notes)
                text_content = source_text.text_content #default initially to existing value

                #update relevant field
                field_to_update = task.metadata.get('update_field', 'text_content')
                if field_to_update == 'text_content':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_content = replace_text_segment(text_content, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_content = task.agent_results
                if field_to_update == 'text_notes':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_notes = replace_text_segment(text_notes, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_notes = task.agent_results
                if field_to_update == 'text_seed':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_seed = replace_text_segment(text_seed, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_seed = task.agent_results

                # Create new version using the agent results
                new_story_text = StoryTextService.create_new_version(
                    source_text=source_text,
                    user=user,
                    version_type=version_type,
                    text_content=text_content,
                    llm_model=task.llm_model,
                    text_seed=text_seed,
                    text_notes=text_notes
                )

                # Once new version is created, update the agent task metadata with new document ID
                task.metadata['generated_document'] = str(new_story_text.id)
                task.save()

            if document_type == 'SceneText':
                # Load the source text document
                source_text = SceneTextModel.objects(id=document_id).first()
                if not source_text:
                    return

                # Load the user who initiated the request
                user_id = task.metadata.get('created_by')
                user = UserModel.objects(id=user_id).first()
                if not user:
                    return #must be a user ID related

                version_type = task.metadata.get('new_version_type', 'generation')
                is_selective = task.metadata.get('selective', False)
                select_text_start = task.metadata.get('select_text_start', None)
                select_text_end = task.metadata.get('select_text_end', None)

                text_seed = task.metadata.get('text_seed', source_text.text_seed)
                text_notes = task.metadata.get('text_notes', source_text.text_notes)
                text_content = source_text.text_content #default initially to existing value

                #update relevant field
                field_to_update = task.metadata.get('update_field', 'text_content')
                if field_to_update == 'text_content':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_content = replace_text_segment(text_content, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_content = task.agent_results
                if field_to_update == 'text_notes':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_notes = replace_text_segment(text_notes, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_notes = task.agent_results
                if field_to_update == 'text_seed':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_seed = replace_text_segment(text_seed, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_seed = task.agent_results

                # Create new version using the agent results
                new_scene_text = SceneTextService.create_new_version(
                    source_text=source_text,
                    user=user,
                    version_type=version_type,
                    title=None, #defaults to existing scene title
                    text_seed=text_seed,
                    text_notes=text_notes,
                    text_content=text_content,
                    llm_model=task.llm_model
                )

                # Once new version is created, update the agent task metadata with new document ID
                task.metadata['generated_document'] = str(new_scene_text.id)
                task.save()

            if document_type == 'MakeScenes':
                #Load the source project
                source_project = ProjectModel.objects(id=document_id).first()
                if not source_project:
                    return

                # Load the user who initiated the request
                user_id = task.metadata.get('created_by')
                user = UserModel.objects(id=user_id).first()
                if not user:
                    return

                try:
                    # Parse the agent results using the JSON extraction and parsing function
                    scenes_data = extract_and_parse_json(task.agent_results)
                except ValueError as e:
                    # Log error if parsing fails and return
                    log_message('error', f"Error parsing JSON from agent results: {e}")
                    return

                if not isinstance(scenes_data, list):
                    # Log error if parsed data is not a list as expected
                    log_message('error', "Parsed data is not in the expected list format")
                    return

                # Call the 'delete all scenes' method to clear existing scenes
                SceneTextService.delete_all_scenes(project_id=document_id)

                # Loop through parsed scenes and create new scenes
                created_scene_ids = []
                for scene in scenes_data:
                    if not isinstance(scene, list) or len(scene) != 2:
                        # Log error if scene format is not as expected
                        log_message('error', "Scene data is not in the expected format (title, description)")
                        continue

                    title, text_seed = scene
                    new_scene_text = SceneTextService.create_scene_text(
                        project_id=document_id,
                        user=user,
                        title=title,
                        text_seed=text_seed
                    )
                    created_scene_ids.append(str(new_scene_text.id))

                # Once all new scenes are created, update the task metadata with the new scene IDs
                task.metadata['created_scenes'] = created_scene_ids
                task.save()

            if document_type == 'SuggestedStoryTitle':
                # Load the project associated with the suggestion
                project = ProjectModel.objects(id=document_id).first()
                if not project:
                    # Log the error and return
                    log_message('error', f"Project with id {document_id} not found.")
                    return

                # Load the user who initiated the request
                user_id = task.metadata.get('created_by')
                user = UserModel.objects(id=user_id).first()
                if not user:
                    # Log the error and return
                    log_message('error', f"User with id {user_id} not found.")
                    return

                # Take the agent results and use them as the title for the new suggestion
                title = task.agent_results

                # Create a new SuggestedStoryTitleModel object using the service method
                new_suggestion = SuggestedStoryTitleService.create_suggestion(
                    project_id=document_id,
                    user=user,
                    title=title
                )

                # Update the agent task metadata with new suggestion ID
                task.metadata['generated_suggestion'] = str(new_suggestion.id)
                task.save()

            if document_type == 'BeatSheet':
                # Load the source text document
                source_text = BeatSheetModel.objects(id=document_id).first()
                if not source_text:
                    return

                # Load the user who initiated the request
                user_id = task.metadata.get('created_by')
                user = UserModel.objects(id=user_id).first()
                if not user:
                    return #must be a user ID related

                version_type = task.metadata.get('new_version_type', 'generation')
                is_selective = task.metadata.get('selective', False)
                select_text_start = task.metadata.get('select_text_start', None)
                select_text_end = task.metadata.get('select_text_end', None)

                scene_text_id = task.metadata.get('scene_text_id', source_text.scene_text_id)
                text_notes = task.metadata.get('text_notes', source_text.text_notes)
                text_content = source_text.text_content #default initially to existing value

                #update relevant field
                field_to_update = task.metadata.get('update_field', 'text_content')
                if field_to_update == 'text_content':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_content = replace_text_segment(text_content, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_content = task.agent_results
                if field_to_update == 'text_notes':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_notes = replace_text_segment(text_notes, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_notes = task.agent_results
                if field_to_update == 'text_seed':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_seed = replace_text_segment(text_seed, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_seed = task.agent_results


                author_style_id = task.metadata.get('author_style_id', None)
                style_guideline_id = task.metadata.get('style_guideline_id', None)
                script_dialog_flavor_id = task.metadata.get('script_dialog_flavor_id', None)
                screenplay_format = task.metadata.get('screenplay_format', False)

                make_script_text = task.metadata.get('make_script_text', False)

                # Create new version using the agent results
                new_beat_sheet = BeatSheetService.create_new_version(
                    source_text=source_text,
                    user=user,
                    version_type=version_type,
                    scene_text_id=scene_text_id,
                    text_notes=text_notes,
                    text_content=text_content,
                    llm_model=task.llm_model,
                )

                # Once new version is created, update the agent task metadata with new document ID
                task.metadata['generated_document'] = str(new_beat_sheet.id)
                task.save()

                if make_script_text:
                    scene_text = source_text.scene_text_id
                    latest_script_text_id = scene_text.getLatestScriptTextId()

                    #trigger the generation of some script text
                    ScriptTextService.generate_from_scene(
                        scene_key=str(source_text.scene_key),
                        text_id=latest_script_text_id,
                        scene_text_id=str(scene_text.id),
                        user_id=user_id,
                        include_beat_sheet=True,
                        author_style_id=author_style_id,
                        style_guideline_id=style_guideline_id,
                        script_dialog_flavor_id=script_dialog_flavor_id,
                        screenplay_format=screenplay_format
                    )


            if document_type == 'ScriptText':
                # Load the source text document
                source_text = ScriptTextModel.objects(id=document_id).first()
                if not source_text:
                    return

                # Load the user who initiated the request
                user_id = task.metadata.get('created_by')
                user = UserModel.objects(id=user_id).first()
                if not user:
                    return #must be a user ID related

                version_type = task.metadata.get('new_version_type', 'generation')
                is_selective = task.metadata.get('selective', False)
                select_text_start = task.metadata.get('select_text_start', None)
                select_text_end = task.metadata.get('select_text_end', None)

                scene_text_id = task.metadata.get('scene_text_id', source_text.scene_text_id)
                text_notes = task.metadata.get('text_notes', source_text.text_notes)
                text_content = source_text.text_content #default initially to existing value

                #update relevant field
                field_to_update = task.metadata.get('update_field', 'text_content')
                if field_to_update == 'text_content':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_content = replace_text_segment(text_content, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_content = task.agent_results
                if field_to_update == 'text_notes':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_notes = replace_text_segment(text_notes, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_notes = task.agent_results
                if field_to_update == 'text_seed':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_seed = replace_text_segment(text_seed, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_seed = task.agent_results


                author_style_id = task.metadata.get('author_style_id', None)
                style_guideline_id = task.metadata.get('style_guideline_id', None)
                script_dialog_flavor_id = task.metadata.get('script_dialog_flavor_id', None)
                screenplay_format = task.metadata.get('screenplay_format', False)

                # Create new version using the agent results
                new_script_text = ScriptTextService.create_new_version(
                    source_text=source_text,
                    user=user,
                    version_type=version_type,
                    scene_text_id=scene_text_id,
                    text_notes=text_notes,
                    text_content=text_content,
                    llm_model=task.llm_model,
                )

                # Once new version is created, update the agent task metadata with new document ID
                task.metadata['generated_document'] = str(new_script_text.id)
                task.save()

            if document_type == 'CharacterProfile':
                # Load the source text document
                source_text = CharacterProfileModel.objects(id=document_id).first()
                if not source_text:
                    return

                # Load the user who initiated the request
                user_id = task.metadata.get('created_by')
                user = UserModel.objects(id=user_id).first()
                if not user:
                    return #must be a user ID related

                version_type = task.metadata.get('new_version_type', 'generation')
                is_selective = task.metadata.get('selective', False)
                select_text_start = task.metadata.get('select_text_start', None)
                select_text_end = task.metadata.get('select_text_end', None)

                text_seed = task.metadata.get('text_seed', source_text.text_seed)
                text_notes = task.metadata.get('text_notes', source_text.text_notes)
                text_content = source_text.text_content #default initially to existing value

                #update relevant field
                field_to_update = task.metadata.get('update_field', 'text_content')
                if field_to_update == 'text_content':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_content = replace_text_segment(text_content, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_content = task.agent_results
                if field_to_update == 'text_notes':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_notes = replace_text_segment(text_notes, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_notes = task.agent_results
                if field_to_update == 'text_seed':
                    if is_selective and (select_text_start or select_text_end):
                        #replace a portion of the text with the agent results
                        text_seed = replace_text_segment(text_seed, select_text_start, select_text_end, task.agent_results)
                    else:
                        #replace the entire text with agent results
                        text_seed = task.agent_results

                # Create new version using the agent results
                new_character_profile = CharacterProfileService.create_new_version(
                    source_text=source_text,
                    user=user,
                    version_type=version_type,
                    name=None, #defaults to existing character name
                    text_seed=text_seed,
                    text_notes=text_notes,
                    text_content=text_content,
                    llm_model=task.llm_model
                )

                # Once new version is created, update the agent task metadata with new document ID
                task.metadata['generated_document'] = str(new_character_profile.id)
                task.save()

        #send the websocket notification
        AgentTaskListener.broadcast(task)
        AgentTaskService.clear_agent_task_cache(task.id)

        return

    @staticmethod
    def agent_task_deleted_listener(event):
        # Placeholder for logic when an agent task is deleted
        pass

    @staticmethod
    def agent_task_reset_listener(event):
        # Placeholder for logic when an agent task is reset
        pass

    def register_listeners(self):
        #AGENT TASKS
        agent_event_service = AgentTaskService.task_events
        agent_event_service.register('agent_task_created', self.agent_task_created_listener)
        agent_event_service.register('agent_task_updated', self.agent_task_updated_listener)
        agent_event_service.register('agent_task_deleted', self.agent_task_deleted_listener)
        agent_event_service.register('agent_task_reset', self.agent_task_reset_listener)
