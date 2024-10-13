from .StoryTextModel import StoryTextModel
from .StoryTextPrompter import StoryTextPrompter
from main.modules.User.UserModel import UserModel
from bson import ObjectId
from bson.errors import InvalidId
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from main.modules.UserPreference.UserPreferenceService import UserPreferenceService
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.libraries.Cache import Cache

class StoryTextService:

    # Create an observable instance for the service
    events = Observable()

    @staticmethod
    def init_story_text(project_id, user, text_seed=None):
        """
        Initializes the story text for a given project.

        :param project_id: The ID of the project.
        :param user: The user object who is initiating the story text.
        :param text_seed: Optional seed text for the story.
        :return: The ID of the existing or newly created story text version.
        """
        latest_story_text = StoryTextModel.objects(project_id=project_id).order_by('-version_number').first()

        if latest_story_text:
            return str(latest_story_text.id)
        else:
            new_story_text = StoryTextModel(
                project_id=project_id,
                version_type='base',
                version_number=1,
                text_seed=text_seed,
                created_by=user,
            )

            new_story_text.save()

            #refresh data
            new_story_text = StoryTextModel.objects(id=new_story_text.id).first()

            #trigger events
            StoryTextService.events.notify(Event('story_text_init', {'story_text': new_story_text}))
            StoryTextService.clear_story_text_cache(project_id)

            return str(new_story_text.id)

    @staticmethod
    def get_story_text(text_id=None, project_id=None, version_number=None):
        """
        Load a story text by text ID or by project ID and optional version number.

        :param text_id: The ID of the story text.
        :param project_id: The ID of the project.
        :param version_number: The version number to retrieve.
        :return: The requested StoryTextModel document.
        """
        try:
            if text_id:
                oid = ObjectId(text_id)
                return StoryTextModel.objects(id=oid).first()
            elif project_id:
                oid = ObjectId(project_id)
                if version_number:
                    return StoryTextModel.objects(project_id=oid, version_number=version_number).first()
                else:
                    return StoryTextModel.objects(project_id=oid).order_by('-version_number').first()
            else:
                raise ValueError("Either text_id or project_id must be provided.")
        except InvalidId as e:
            raise ValueError(f"Invalid ObjectId: {e}")

    @staticmethod
    def list_story_versions(project_id):
        """
        Retrieve a list of all story text versions by project ID.

        :param project_id: The ID of the project.
        :return: A list of story text versions with selected fields, sorted by version number.
        """
        versions = StoryTextModel.objects(project_id=project_id).order_by('version_number')
        version_list = []
        for version in versions:
            version_list.append({
                'id': str(version.id),
                'version_type': version.version_type,
                'version_number': version.version_number,
                'source_version_number': version.source_version.version_number if version.source_version else None,
                'version_label': version.version_label,
                'character_count': version.character_count,
                'llm_model': version.llm_model,
                'created_at': version.created_at
            })
        return version_list

    @staticmethod
    def create_new_version(source_text, user, version_type, text_seed=None, text_notes=None, text_content=None, llm_model=None):
        """
        Creates a new version of story text based on the source text.

        :param source_text: The source StoryTextModel object to base the new version on.
        :param user: The user object who is creating the new version.
        :param version_type: The version type for the new version (e.g., 'edit', 'note', 'seed').
        :param text_seed: Optional seed text for the new version.
        :param text_notes: Optional notes for the new version.
        :param text_content: Optional content text for the new version.
        :return: The newly created StoryTextModel object.
        """
        # Determine the latest version number for the project and increment it
        latest_version = StoryTextModel.objects(project_id=source_text.project_id).order_by('-version_number').first()
        next_version_number = latest_version.version_number + 1 if latest_version else 1

        # Create the new version
        new_story_text = StoryTextModel(
            project_id=source_text.project_id,
            version_type=version_type,
            source_version=source_text,
            version_number=next_version_number,
            text_seed=text_seed if text_seed is not None else source_text.text_seed,
            text_notes=text_notes if text_notes is not None else source_text.text_notes,
            text_content=text_content if text_content is not None else source_text.text_content,
            character_count=len(text_content) if text_content is not None else source_text.character_count,
            llm_model=llm_model if llm_model is not None else source_text.llm_model,
            created_by=user
        )
        new_story_text.save()

        #refresh data
        new_story_text = StoryTextModel.objects(id=new_story_text.id).first()

        #trigger events
        StoryTextService.events.notify(Event('story_text_new_version', {'story_text': new_story_text}))
        StoryTextService.clear_story_text_cache(new_story_text.project_id.id)

        return new_story_text

    @staticmethod
    def rebase_story_text(story_text_id=None, project_id=None, version_number=None):
        """
        Rebase to a selected story text version, archiving all other versions.

        :param story_text_id: The ID of the story text to rebase to.
        :param project_id: The ID of the project (used if story_text_id is not provided).
        :param version_number: The version number to rebase to (used if story_text_id is not provided).
        """
        # Find the story text to rebase to
        if story_text_id:
            new_base = StoryTextModel.objects(id=story_text_id).first()
        elif project_id and version_number:
            new_base = StoryTextModel.objects(project_id=project_id, version_number=version_number).first()
        else:
            raise ValueError("Either story_text_id or (project_id and version_number) must be provided.")

        if not new_base:
            raise ValueError("Story text to rebase to does not exist.")

        # Rebase the selected version
        new_base.version_type = 'base'
        new_base.version_number = 1
        new_base.source_version = None
        new_base.save()

        # Delete all other versions
        if project_id is None:
            project_id = new_base.project_id
        StoryTextModel.objects(project_id=project_id, id__ne=new_base.id).delete()

        # Save the new base as the only version
        new_base.save()

        #trigger events
        StoryTextService.events.notify(Event('story_text_rebased', {'story_text': new_base}))
        StoryTextService.clear_story_text_cache(new_base.project_id.id)

        return True

    @staticmethod
    def update_version_label(story_text_id=None, project_id=None, version_number=None, version_label=''):
        """
        Updates the version label field without creating a new version.

        :param story_text_id: The ID of the story text to update the label.
        :param project_id: The ID of the project (used if story_text_id is not provided).
        :param version_number: The version number to update the label (used if story_text_id is not provided).
        :param version_label: The new version label.
        """
        # Find the story text to update the label
        if story_text_id:
            story_text = StoryTextModel.objects(id=story_text_id).first()
        elif project_id and version_number:
            story_text = StoryTextModel.objects(project_id=project_id, version_number=version_number).first()
        else:
            raise ValueError("Either story_text_id or (project_id and version_number) must be provided.")

        if not story_text:
            raise ValueError("Story text to update the label does not exist.")

        # Update the version label
        story_text.version_label = version_label
        story_text.save()

        #trigger events
        StoryTextService.events.notify(Event('story_text_version_label', {'story_text': story_text}))
        StoryTextService.clear_story_text_cache(story_text.project_id.id)

        return True


    @staticmethod
    def update_story_text(text_id, user, text_seed=None, text_notes=None, text_content=None):
        """
        Update a story text by creating a new version with updated fields.

        :param text_id: The ID of the source story text to update from.
        :param user: The user object who is updating the story text.
        :param text_seed: Optional updated seed text.
        :param text_notes: Optional updated notes.
        :param text_content: Optional updated content text.
        :return: The newly created StoryTextModel document.
        """
        source_text = StoryTextModel.objects(id=text_id).first()
        if not source_text:
            raise ValueError("The source story text does not exist.")

        # Use the create_new_version method to handle the creation of a new version
        new_story_text = StoryTextService.create_new_version(
            source_text=source_text,
            user=user,
            version_type='edit',
            text_seed=text_seed,
            text_notes=text_notes,
            text_content=text_content
        )
        return new_story_text

    @staticmethod
    def generate_from_seed(project_id, text_id, text_seed=None, user_id=None):
        # Load the story text object
        story_text = StoryTextModel.objects(id=text_id).first()
        if not story_text:
            raise ValueError("The story text does not exist.")
        if str(story_text.project_id.id) != str(project_id):
            raise ValueError("Story text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = StoryTextPrompter.prompt_from_seed(story_text, text_seed, default_llm)

        if text_seed:
            use_seed_text = text_seed
        else:
            use_seed_text = story_text.text_seed

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'new',
            'text_seed': use_seed_text
        }

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'StoryText', story_text.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def generate_with_notes(project_id, text_id, text_notes=None, user_id=None, select_text_start=None, select_text_end=None):
        # Load the story text object
        story_text = StoryTextModel.objects(id=text_id).first()
        if not story_text:
            raise ValueError("The story text does not exist.")
        if str(story_text.project_id.id) != str(project_id):
            raise ValueError("Story text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = StoryTextPrompter.prompt_with_notes(story_text, text_notes, default_llm, select_text_start, select_text_end)

        if text_notes:
            use_notes_text = text_notes
        else:
            use_notes_text = story_text.text_notes

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
            project_id, 'StoryText', story_text.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def clear_story_text_cache(project_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'story_text_versions_project_id:{project_id}')
        tags_to_clear.append(f'story_text_project_id:{project_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)

        #also clear for project for the latestStoryTextId
        from main.modules.Project.ProjectService import ProjectService
        ProjectService.clear_project_cache(project_id)
