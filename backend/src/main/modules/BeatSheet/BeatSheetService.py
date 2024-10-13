from .BeatSheetModel import BeatSheetModel
from .BeatSheetPrompter import BeatSheetPrompter
from main.modules.User.UserModel import UserModel
from bson import ObjectId
from bson.errors import InvalidId
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from main.modules.SceneText.SceneTextModel import SceneTextModel
from uuid import UUID
from main.modules.UserPreference.UserPreferenceService import UserPreferenceService
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.libraries.Cache import Cache

class BeatSheetService:

    # Create an observable instance for the service
    events = Observable()

    @staticmethod
    def init_beat_sheet(scene_key, user, scene_text_id):
        """
        Initializes the beat sheet for a given scene.

        :param scene_key: The key of the scene.
        :param user: The user object who is initiating the beat sheet.
        :param scene_text_id: The ID of the scene text that the beat sheet is based on.
        :return: The ID of the newly created beat sheet version.
        """
        # Ensure that the scene_key and scene_text_id are valid ObjectIds
        try:
            scene_key_oid = UUID(scene_key)
            scene_text_id_oid = ObjectId(scene_text_id)
        except InvalidId as e:
            raise ValueError(f"Invalid ObjectId: {e}")

        latest_beat_sheet = BeatSheetModel.objects(scene_key=scene_key_oid).order_by('-version_number').first()

        if latest_beat_sheet:
            return str(latest_beat_sheet.id)
        else:
            new_beat_sheet = BeatSheetModel(
                scene_key=scene_key_oid,
                version_type='base',
                version_number=1,
                scene_text_id=scene_text_id_oid,
                created_by=user,
            )

            new_beat_sheet.save()

            #refresh data
            new_beat_sheet = BeatSheetModel.objects(id=new_beat_sheet.id).first()

            #trigger events
            BeatSheetService.events.notify(Event('beat_sheet_init', {'beat_sheet': new_beat_sheet}))
            BeatSheetService.clear_beat_sheet_cache(new_beat_sheet.scene_key)

            return str(new_beat_sheet.id)


    @staticmethod
    def get_beat_sheet(text_id=None, scene_key=None, version_number=None):
        """
        Load a beat sheet by text ID or by scene key and optional version number.

        :param text_id: The ID of the beat sheet.
        :param scene_key: The key of the scene.
        :param version_number: The version number to retrieve.
        :return: The requested BeatSheet Model document.
        """
        try:
            if text_id:
                oid = ObjectId(text_id)
                return BeatSheetModel.objects(id=oid).first()
            elif scene_key:
                oid = UUID(scene_key)
                if version_number:
                    return BeatSheetModel.objects(scene_key=oid, version_number=version_number).first()
                else:
                    return BeatSheetModel.objects(scene_key=oid).order_by('-version_number').first()
            else:
                raise ValueError("Either text_id or scene_key must be provided.")
        except InvalidId as e:
            raise ValueError(f"Invalid ObjectId: {e}")

    @staticmethod
    def list_beat_sheet_versions(scene_key):
        """
        Retrieve a list of all beat sheet versions by scene key.

        :param scene_key: The key of the scene.
        :return: A list of beat sheet versions with selected fields, sorted by version number.
        """
        versions = BeatSheetModel.objects(scene_key=scene_key).order_by('version_number')
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
        Creates a new version of beat sheet based on the source text.

        :param source_text: The source BeatSheetModel object to base the new version on.
        :param user: The user object who is creating the new version.
        :param version_type: The version type for the new version (e.g., 'edit', 'note').
        :param scene_text_id: The ID of the scene text that the new version is based on.
        :param text_notes: Optional notes for the new version.
        :param text_content: Optional content text for the new version.
        :param llm_model: Optional LLM model used for the new version.
        :return: The newly created BeatSheetModel object.
        """
        # Determine the latest version number for the scene and increment it
        latest_version = BeatSheetModel.objects(scene_key=source_text.scene_key).order_by('-version_number').first()
        next_version_number = latest_version.version_number + 1 if latest_version else 1

        # Create the new version
        new_beat_sheet = BeatSheetModel(
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
        new_beat_sheet.save()

        #refresh data
        new_beat_sheet = BeatSheetModel.objects(id=new_beat_sheet.id).first()

        #trigger events
        BeatSheetService.events.notify(Event('beat_sheet_new_version', {'beat_sheet': new_beat_sheet}))
        BeatSheetService.clear_beat_sheet_cache(new_beat_sheet.scene_key)

        return new_beat_sheet

    @staticmethod
    def rebase_beat_sheet(beat_sheet_id=None, scene_key=None, version_number=None):
        """
        Rebase to a selected beat sheet version, archiving all other versions.

        :param beat_sheet_id: The ID of the beat sheet to rebase to.
        :param scene_key: The key of the scene (used if beat_sheet_id is not provided).
        :param version_number: The version number to rebase to (used if beat_sheet_id is not provided).
        """
        # Find the beat sheet to rebase to
        if beat_sheet_id:
            new_base = BeatSheetModel.objects(id=beat_sheet_id).first()
        elif scene_key and version_number:
            new_base = BeatSheetModel.objects(scene_key=UUID(scene_key), version_number=version_number).first()
        else:
            raise ValueError("Either beat_sheet_id or (scene_key and version_number) must be provided.")

        if not new_base:
            raise ValueError("Beat sheet to rebase to does not exist.")

        # Rebase the selected version
        new_base.version_type = 'base'
        new_base.version_number = 1
        new_base.source_version = None
        new_base.save()

        # Delete all other versions
        BeatSheetModel.objects(scene_key=UUID(scene_key), id__ne=new_base.id).delete()

        # Save the new base as the only version
        new_base.save()

        #trigger events
        BeatSheetService.events.notify(Event('beat_sheet_rebased', {'beat_sheet': new_base}))
        BeatSheetService.clear_beat_sheet_cache(new_base.scene_key)

        return True

    @staticmethod
    def update_version_label(beat_sheet_id=None, scene_key=None, version_number=None, version_label=''):
        """
        Updates the version label field without creating a new version.

        :param beat_sheet_id: The ID of the beat sheet to update the label.
        :param scene_key: The key of the scene (used if beat_sheet_id is not provided).
        :param version_number: The version number to update the label (used if beat_sheet_id is not provided).
        :param version_label: The new version label.
        """
        # Find the beat sheet to update the label
        if beat_sheet_id:
            beat_sheet = BeatSheetModel.objects(id=beat_sheet_id).first()
        elif scene_key and version_number:
            beat_sheet = BeatSheetModel.objects(scene_key=UUID(scene_key), version_number=version_number).first()
        else:
            raise ValueError("Either beat_sheet_id or (scene_key and version_number) must be provided.")

        if not beat_sheet:
            raise ValueError("Beat sheet to update the label does not exist.")

        # Update the version label
        beat_sheet.version_label = version_label
        beat_sheet.save()

        #trigger events
        BeatSheetService.events.notify(Event('beat_sheet_version_label', {'beat_sheet': beat_sheet}))
        BeatSheetService.clear_beat_sheet_cache(beat_sheet.scene_key)

        return True


    @staticmethod
    def update_beat_sheet(text_id, user, scene_text_id, text_notes=None, text_content=None):
        """
        Update a beat sheet by creating a new version with updated fields.

        :param text_id: The ID of the source beat sheet to update from.
        :param user: The user object who is updating the beat sheet.
        :param scene_text_id: The ID of the scene text that the new version is based on.
        :param text_notes: Optional updated notes.
        :param text_content: Optional updated content text.
        :return: The newly created BeatSheetModel document.
        """
        source_text = BeatSheetModel.objects(id=text_id).first()
        if not source_text:
            raise ValueError("The source beat sheet does not exist.")

        # Use the create_new_version method to handle the creation of a new version
        new_beat_sheet = BeatSheetService.create_new_version(
            source_text=source_text,
            user=user,
            version_type='edit',
            scene_text_id=scene_text_id,
            text_notes=text_notes,
            text_content=text_content
        )
        return new_beat_sheet

    @staticmethod
    def generate_from_scene(scene_key, text_id, scene_text_id, user_id=None,
        author_style_id=None,
        style_guideline_id=None,
        script_dialog_flavor_id=None,
        screenplay_format=False,
        make_script_text=False
    ):
        # Load the beat sheet object
        beat_sheet = BeatSheetModel.objects(id=text_id).first()
        if not beat_sheet:
            raise ValueError("The beat sheet does not exist.")

        # Load the scene text object
        try:
            scene_text = SceneTextModel.objects(id=scene_text_id, scene_key=UUID(scene_key)).first()
        except InvalidId:
            raise ValueError("Invalid ObjectId for scene_text_id or scene_key")
        if not scene_text:
            raise ValueError("The scene text does not exist or does not belong to the provided scene_key.")

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

        # Form the prompt details for our agent
        prompt_data = BeatSheetPrompter.prompt_from_scene(
            beat_sheet=beat_sheet,
            scene_text=scene_text,
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
            'author_style_id': str(author_style_id) if author_style else None,
            'style_guideline_id': str(style_guideline_id) if style_guideline else None,
            'script_dialog_flavor_id': str(script_dialog_flavor_id) if script_dialog_flavor else None,
            'screenplay_format': screenplay_format,
            'make_script_text': make_script_text #triggers the immediate generation of new script text if set to true
        }

        project_id = beat_sheet.getProject().id

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'BeatSheet', beat_sheet.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def generate_with_notes(scene_key, text_id, text_notes=None, user_id=None,
        author_style_id=None,
        style_guideline_id=None,
        script_dialog_flavor_id=None,
        screenplay_format=False,
        select_text_start=None,
        select_text_end=None,
    ):
        # Load the beat sheet object
        beat_sheet = BeatSheetModel.objects(id=text_id).first()
        if not beat_sheet:
            raise ValueError("The beat sheet does not exist.")

        # Load the scene text object based on the beat_sheet's scene_text_id
        try:
            scene_text = SceneTextModel.objects(id=beat_sheet.scene_text_id.id, scene_key=UUID(scene_key)).first()
        except InvalidId:
            raise ValueError("Invalid ObjectId for scene_key or beat_sheet.scene_text_id")
        if not scene_text:
            raise ValueError("The scene text does not exist or does not belong to the provided scene_key.")

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

        # Form the prompt details for our agent
        prompt_data = BeatSheetPrompter.prompt_with_notes(
            beat_sheet=beat_sheet,
            scene_text=scene_text,
            text_notes=text_notes,
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
            'text_notes': text_notes if text_notes else beat_sheet.text_notes,
            'scene_text_id': str(scene_text.id),
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


        project_id = beat_sheet.getProject().id

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'BeatSheet', beat_sheet.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def clear_beat_sheet_cache(scene_key):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'beat_sheet_scene_key:{scene_key}')
        tags_to_clear.append(f'beat_sheet_versions_scene_key:{scene_key}')
        tags_to_clear.append(f'scene_text_scene_key:{scene_key}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)

        #also clear cache for the scene, for latestBeatSheet
        from main.modules.SceneText.SceneTextService import SceneTextService
        get_scene = SceneTextModel.objects(scene_key=scene_key).first()
        SceneTextService.clear_scene_text_cache(str(get_scene.project_id))
