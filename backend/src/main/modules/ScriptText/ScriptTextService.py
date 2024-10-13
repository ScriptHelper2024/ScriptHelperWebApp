from .ScriptTextModel import ScriptTextModel
from .ScriptTextPrompter import ScriptTextPrompter
from main.modules.User.UserModel import UserModel
from bson import ObjectId
from bson.errors import InvalidId
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.BeatSheet.BeatSheetService import BeatSheetService
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.AuthorStyle.AuthorStyleModel import AuthorStyleModel
from main.modules.StyleGuideline.StyleGuidelineModel import StyleGuidelineModel
from main.modules.ScriptDialogFlavor.ScriptDialogFlavorModel import ScriptDialogFlavorModel
from uuid import UUID
from main.modules.UserPreference.UserPreferenceService import UserPreferenceService
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.libraries.Cache import Cache

class ScriptTextService:

    # Create an observable instance for the service
    events = Observable()

    @staticmethod
    def init_script_text(scene_key, user, scene_text_id):
        """
        Initializes the script text for a given scene.

        :param scene_key: The key of the scene.
        :param user: The user object who is initiating the script text.
        :param scene_text_id: The ID of the scene text that the script text is based on.
        :return: The ID of the newly created script text version.
        """
        # Ensure that the scene_key and scene_text_id are valid ObjectIds
        try:
            scene_key_oid = UUID(scene_key)
            scene_text_id_oid = ObjectId(scene_text_id)
        except InvalidId as e:
            raise ValueError(f"Invalid ObjectId: {e}")

        latest_script_text = ScriptTextModel.objects(scene_key=scene_key_oid).order_by('-version_number').first()

        if latest_script_text:
            return str(latest_script_text.id)
        else:
            new_script_text = ScriptTextModel(
                scene_key=scene_key_oid,
                version_type='base',
                version_number=1,
                scene_text_id=scene_text_id_oid,
                created_by=user,
            )

            new_script_text.save()

            #refresh data
            new_script_text = ScriptTextModel.objects(id=new_script_text.id).first()

            #trigger events
            ScriptTextService.events.notify(Event('script_text_init', {'script_text': new_script_text}))
            ScriptTextService.clear_script_text_cache(new_script_text.scene_key)

            return str(new_script_text.id)


    @staticmethod
    def get_script_text(text_id=None, scene_key=None, version_number=None):
        """
        Load a script text by text ID or by scene key and optional version number.

        :param text_id: The ID of the script text.
        :param scene_key: The key of the scene.
        :param version_number: The version number to retrieve.
        :return: The requested ScriptText Model document.
        """
        try:
            if text_id:
                oid = ObjectId(text_id)
                return ScriptTextModel.objects(id=oid).first()
            elif scene_key:
                oid = UUID(scene_key)
                if version_number:
                    return ScriptTextModel.objects(scene_key=oid, version_number=version_number).first()
                else:
                    return ScriptTextModel.objects(scene_key=oid).order_by('-version_number').first()
            else:
                raise ValueError("Either text_id or scene_key must be provided.")
        except InvalidId as e:
            raise ValueError(f"Invalid ObjectId: {e}")

    @staticmethod
    def list_script_text_versions(scene_key):
        """
        Retrieve a list of all script text versions by scene key.

        :param scene_key: The key of the scene.
        :return: A list of script text versions with selected fields, sorted by version number.
        """
        versions = ScriptTextModel.objects(scene_key=scene_key).order_by('version_number')
        version_list = []
        for version in versions:
            version_list.append({
                'id': str(version.id),
                'scene_key': str(version.scene_key),
                'scene_text_id': str(version.scene_text_id.id),
                'version_type': version.version_type,
                'version_number': version.version_number,
                'source_version_number': version.source_version.version_number if version.source_version else None,
                'version_label': version.version_label,
                'character_count': version.character_count,
                'llm_model': version.llm_model,
                'created_at': version.created_at,
                'created_by': str(version.created_by.id)
            })
        return version_list

    @staticmethod
    def create_new_version(source_text, user, version_type, scene_text_id, text_notes=None, text_content=None, llm_model=None):
        """
        Creates a new version of script text based on the source text.

        :param source_text: The source ScriptTextModel object to base the new version on.
        :param user: The user object who is creating the new version.
        :param version_type: The version type for the new version (e.g., 'edit', 'note').
        :param scene_text_id: The ID of the scene text that the new version is based on.
        :param text_notes: Optional notes for the new version.
        :param text_content: Optional content text for the new version.
        :param llm_model: Optional LLM model used for the new version.
        :return: The newly created ScriptTextModel object.
        """
        # Determine the latest version number for the scene and increment it
        latest_version = ScriptTextModel.objects(scene_key=source_text.scene_key).order_by('-version_number').first()
        next_version_number = latest_version.version_number + 1 if latest_version else 1

        # Create the new version
        new_script_text = ScriptTextModel(
            scene_key=source_text.scene_key,
            version_type=version_type,
            source_version=source_text,
            version_number=next_version_number,
            scene_text_id=ObjectId(scene_text_id),
            text_notes=text_notes if text_notes is not None else source_text.text_notes,
            text_content=text_content if text_content is not None else source_text.text_content,
            character_count=len(text_content) if text_content is not None else source_text.character_count,
            llm_model=llm_model if llm_model is not None else source_text.llm_model,
            created_by=user
        )
        new_script_text.save()

        #refresh data
        new_script_text = ScriptTextModel.objects(id=new_script_text.id).first()

        #trigger events
        ScriptTextService.events.notify(Event('script_text_new_version', {'script_text': new_script_text}))
        ScriptTextService.clear_script_text_cache(new_script_text.scene_key)

        return new_script_text

    @staticmethod
    def rebase_script_text(script_text_id=None, scene_key=None, version_number=None):
        """
        Rebase to a selected script text version, archiving all other versions.

        :param script_text_id: The ID of the script text to rebase to.
        :param scene_key: The key of the scene (used if script_text_id is not provided).
        :param version_number: The version number to rebase to (used if script_text_id is not provided).
        """
        # Find the script text to rebase to
        if script_text_id:
            new_base = ScriptTextModel.objects(id=script_text_id).first()
        elif scene_key and version_number:
            new_base = ScriptTextModel.objects(scene_key=UUID(scene_key), version_number=version_number).first()
        else:
            raise ValueError("Either script_text_id or (scene_key and version_number) must be provided.")

        if not new_base:
            raise ValueError("Beat sheet to rebase to does not exist.")

        # Rebase the selected version
        new_base.version_type = 'base'
        new_base.version_number = 1
        new_base.source_version = None
        new_base.save()

        # Delete all other versions
        ScriptTextModel.objects(scene_key=UUID(scene_key), id__ne=new_base.id).delete()

        # Save the new base as the only version
        new_base.save()

        #trigger events
        ScriptTextService.events.notify(Event('script_text_rebased', {'script_text': new_base}))
        ScriptTextService.clear_script_text_cache(new_base.scene_key)

        return True

    @staticmethod
    def update_version_label(script_text_id=None, scene_key=None, version_number=None, version_label=''):
        """
        Updates the version label field without creating a new version.

        :param script_text_id: The ID of the script text to update the label.
        :param scene_key: The key of the scene (used if script_text_id is not provided).
        :param version_number: The version number to update the label (used if script_text_id is not provided).
        :param version_label: The new version label.
        """
        # Find the script text to update the label
        if script_text_id:
            script_text = ScriptTextModel.objects(id=script_text_id).first()
        elif scene_key and version_number:
            script_text = ScriptTextModel.objects(scene_key=UUID(scene_key), version_number=version_number).first()
        else:
            raise ValueError("Either script_text_id or (scene_key and version_number) must be provided.")

        if not script_text:
            raise ValueError("Beat sheet to update the label does not exist.")

        # Update the version label
        script_text.version_label = version_label
        script_text.save()

        #trigger events
        ScriptTextService.events.notify(Event('script_text_version_label', {'script_text': script_text}))
        ScriptTextService.clear_script_text_cache(script_text.scene_key)

        return True


    @staticmethod
    def update_script_text(text_id, user, scene_text_id, text_notes=None, text_content=None):
        """
        Update a script text by creating a new version with updated fields.

        :param text_id: The ID of the source script text to update from.
        :param user: The user object who is updating the script text.
        :param scene_text_id: The ID of the scene text that the new version is based on.
        :param text_notes: Optional updated notes.
        :param text_content: Optional updated content text.
        :return: The newly created ScriptTextModel document.
        """
        source_text = ScriptTextModel.objects(id=text_id).first()
        if not source_text:
            raise ValueError("The source script text does not exist.")

        # Use the create_new_version method to handle the creation of a new version
        new_script_text = ScriptTextService.create_new_version(
            source_text=source_text,
            user=user,
            version_type='edit',
            scene_text_id=scene_text_id,
            text_notes=text_notes,
            text_content=text_content
        )
        return new_script_text

    @staticmethod
    def generate_from_scene(scene_key, text_id, scene_text_id, user_id=None,
        include_beat_sheet=True,
        author_style_id=None,
        style_guideline_id=None,
        script_dialog_flavor_id=None,
        screenplay_format=False
        ):

        # Load the script text object
        script_text = ScriptTextModel.objects(id=text_id).first()
        if not script_text:
            raise ValueError("The script text does not exist.")

        # Load the scene text object
        scene_text = SceneTextModel.objects(id=scene_text_id, scene_key=UUID(scene_key)).first()
        if not scene_text:
            raise ValueError("The scene text does not exist or does not belong to the provided scene_key.")

        # Optionally load the beat sheet
        beat_sheet = None
        beat_sheet_id = None
        if include_beat_sheet:
            beat_sheet_id = scene_text.getLatestBeatSheetId()
            if beat_sheet_id:
                beat_sheet = BeatSheetModel.objects(id=beat_sheet_id).first()

        # Load the additional models based on provided IDs and conditions
        author_style = None
        if author_style_id:
            author_style = AuthorStyleModel.objects(id=author_style_id, archived=False).first()
            if author_style and not (author_style.is_global or author_style.user.id == user_id):
                author_style = None  # The style is neither global nor owned by the user

        style_guideline = None
        if style_guideline_id:
            style_guideline = StyleGuidelineModel.objects(id=style_guideline_id, archived=False).first()
            if style_guideline and not (style_guideline.is_global or style_guideline.user.id == user_id):
                style_guideline = None

        script_dialog_flavor = None
        if script_dialog_flavor_id:
            script_dialog_flavor = ScriptDialogFlavorModel.objects(id=script_dialog_flavor_id, archived=False).first()
            if script_dialog_flavor and not (script_dialog_flavor.is_global or script_dialog_flavor.user.id == user_id):
                script_dialog_flavor = None

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = ScriptTextPrompter.prompt_from_scene(
            script_text=script_text,
            scene_text=scene_text,
            beat_sheet=beat_sheet,
            author_style=author_style,
            style_guideline=style_guideline,
            script_dialog_flavor=script_dialog_flavor,
            screenplay_format=screenplay_format,
            default_llm=default_llm
        )

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'new',
            'scene_text_id': str(scene_text_id),
            'beat_sheet_id': str(beat_sheet.id) if beat_sheet else None,
            'author_style_id': str(author_style_id) if author_style else None,
            'style_guideline_id': str(style_guideline_id) if style_guideline else None,
            'script_dialog_flavor_id': str(script_dialog_flavor_id) if script_dialog_flavor else None,
            'screenplay_format': screenplay_format
        }

        project_id = script_text.getProject().id

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'ScriptText', script_text.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def generate_with_notes(scene_key, text_id, text_notes=None, user_id=None,
                            include_beat_sheet=True,
                            author_style_id=None,
                            style_guideline_id=None,
                            script_dialog_flavor_id=None,
                            screenplay_format=False,
                            select_text_start=None,
                            select_text_end=None,
                           ):

        # Load the script text object
        script_text = ScriptTextModel.objects(id=text_id).first()
        if not script_text:
            raise ValueError("The script text does not exist.")

        # Load the scene text object based on the script_text's scene_text_id
        scene_text = SceneTextModel.objects(id=script_text.scene_text_id.id, scene_key=UUID(scene_key)).first()
        if not scene_text:
            raise ValueError("The scene text does not exist or does not belong to the provided scene_key.")

        # Optionally load the beat sheet
        beat_sheet = None
        if include_beat_sheet:
            beat_sheet_id = scene_text.getLatestBeatSheetId()
            if beat_sheet_id:
                beat_sheet = BeatSheetModel.objects(id=beat_sheet_id).first()

        # Load and check the additional models based on provided IDs and conditions
        author_style = None
        if author_style_id:
            author_style = AuthorStyleModel.objects(id=author_style_id, archived=False).first()
            if author_style and not (author_style.is_global or author_style.user.id == user_id):
                author_style = None  # The style is neither global nor owned by the user

        style_guideline = None
        if style_guideline_id:
            style_guideline = StyleGuidelineModel.objects(id=style_guideline_id, archived=False).first()
            if style_guideline and not (style_guideline.is_global or style_guideline.user.id == user_id):
                style_guideline = None

        script_dialog_flavor = None
        if script_dialog_flavor_id:
            script_dialog_flavor = ScriptDialogFlavorModel.objects(id=script_dialog_flavor_id, archived=False).first()
            if script_dialog_flavor and not (script_dialog_flavor.is_global or script_dialog_flavor.user.id == user_id):
                script_dialog_flavor = None

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt detailsfor our agent
        prompt_data = ScriptTextPrompter.prompt_with_notes(
            script_text=script_text,
            scene_text=scene_text,
            text_notes=text_notes,
            beat_sheet=beat_sheet,
            author_style=author_style,
            style_guideline=style_guideline,
            script_dialog_flavor=script_dialog_flavor,
            screenplay_format=screenplay_format,
            default_llm=default_llm,
            select_text_start=select_text_start,
            select_text_end=select_text_end,
        )

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'note',
            'text_notes': text_notes if text_notes else script_text.text_notes,
            'scene_text_id': str(scene_text.id),
            'beat_sheet_id': str(beat_sheet.id) if beat_sheet else None,
            'author_style_id': str(author_style_id) if author_style else None,
            'style_guideline_id': str(style_guideline_id) if style_guideline else None,
            'script_dialog_flavor_id': str(script_dialog_flavor_id) if script_dialog_flavor else None,
            'screenplay_format': screenplay_format,
            'selective': False
        }

        if select_text_start or select_text_end:
            task_metadata['selective'] = True
            task_metadata['select_text_start'] = select_text_start
            task_metadata['select_text_end'] = select_text_end

        project_id = script_text.getProject().id

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'ScriptText', script_text.id, prompt_data, task_metadata
        )

        return agent_task.id

    def generate_script_and_beat_sheet(scene_key, scene_text_id, user_id=None,
        author_style_id=None,
        style_guideline_id=None,
        script_dialog_flavor_id=None,
        screenplay_format=False
    ):
        # Load the scene text object based on the script_text's scene_text_id
        scene_text = SceneTextModel.objects(id=scene_text_id, scene_key=UUID(scene_key)).first()
        if not scene_text:
            raise ValueError("The scene text does not exist or does not belong to the provided scene_key.")

        beat_sheet_id = scene_text.getLatestBeatSheetId()

        #generate a beat sheet first, including a parameter to trigger a scene generation after its done
        make_beat_sheet_task = BeatSheetService.generate_from_scene(
            scene_key=scene_key,
            text_id=beat_sheet_id,
            scene_text_id=scene_text_id,
            user_id=user_id,
            author_style_id=author_style_id,
            style_guideline_id=style_guideline_id,
            script_dialog_flavor_id=script_dialog_flavor_id,
            screenplay_format=screenplay_format,
            make_script_text=True
        )

        return make_beat_sheet_task

    @staticmethod
    def clear_script_text_cache(scene_key):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'script_text_scene_key:{scene_key}')
        tags_to_clear.append(f'script_text_versions_scene_key:{scene_key}')
        tags_to_clear.append(f'scene_text_scene_key:{scene_key}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)

        #also clear cache for the scene, for latestScriptText
        from main.modules.SceneText.SceneTextService import SceneTextService
        get_scene = SceneTextModel.objects(scene_key=scene_key).first()
        SceneTextService.clear_scene_text_cache(str(get_scene.project_id))
