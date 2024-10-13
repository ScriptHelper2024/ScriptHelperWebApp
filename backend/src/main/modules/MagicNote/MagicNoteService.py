from .MagicNoteCriticModel import MagicNoteCriticModel
from .MagicNotePrompter import MagicNotePrompter
from main.modules.User.UserModel import UserModel
from mongoengine import NotUniqueError, DoesNotExist
from mongoengine.queryset import QuerySet
from bson import ObjectId
from bson.errors import InvalidId
from mongoengine.queryset.visitor import Q
from datetime import datetime
from graphql import GraphQLError
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from main.modules.UserPreference.UserPreferenceService import UserPreferenceService
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.config.settings import settings
from main.libraries.Cache import Cache

class MagicNoteService:

    @staticmethod
    def create_magic_note_critic(user, name, active=False, order_rank=0,
                                 story_text_prompt=None, scene_text_prompt=None,
                                 beat_sheet_prompt=None, script_text_prompt=None,
                                 update_existing=False):
        """
        Create or update a MagicNoteCriticModel object based on the 'update_existing' flag,
        with trimmed prompt texts.
        """
        try:
            # Trim whitespace from prompts if they are not None
            if story_text_prompt is not None:
                story_text_prompt = story_text_prompt.strip()
            if scene_text_prompt is not None:
                scene_text_prompt = scene_text_prompt.strip()
            if beat_sheet_prompt is not None:
                beat_sheet_prompt = beat_sheet_prompt.strip()
            if script_text_prompt is not None:
                script_text_prompt = script_text_prompt.strip()

            # Attempt to find an existing critic with the same name
            magic_note_critic = MagicNoteCriticModel.objects(name=name).first()

            if magic_note_critic:
                if update_existing:
                    # Update existing critic's fields
                    magic_note_critic.user_id = user
                    magic_note_critic.active = active
                    magic_note_critic.order_rank = order_rank
                    magic_note_critic.story_text_prompt = story_text_prompt
                    magic_note_critic.scene_text_prompt = scene_text_prompt
                    magic_note_critic.beat_sheet_prompt = beat_sheet_prompt
                    magic_note_critic.script_text_prompt = script_text_prompt
                    magic_note_critic.save()
                else:
                    # If a critic exists and 'update_existing' is False, raise an error
                    raise GraphQLError('A critic with the same name already exists.')
            else:
                # If no critic exists with the same name, create a new one
                magic_note_critic = MagicNoteCriticModel(
                    user_id=user,
                    name=name.strip(),  # Also trim name for consistency
                    active=active,
                    order_rank=order_rank,
                    story_text_prompt=story_text_prompt,
                    scene_text_prompt=scene_text_prompt,
                    beat_sheet_prompt=beat_sheet_prompt,
                    script_text_prompt=script_text_prompt
                )
                magic_note_critic.save()

            MagicNoteService.clear_magic_note_critic_cache(magic_note_critic.id)

            #refresh data
            magic_note_critic = MagicNoteCriticModel.objects(id=magic_note_critic.id).first()

            return magic_note_critic

        except NotUniqueError as e:
            # Handle the unique constraint violation here if needed
            raise e  # Or return a specific message or code

        except NotUniqueError as e:
            # Handle the unique constraint violation here if needed
            raise e  # Or return a specific message or code

    @staticmethod
    def update_magic_note_critic(critic_id, active=None, name=None, order_rank=None,
                                 story_text_prompt=None, scene_text_prompt=None,
                                 beat_sheet_prompt=None, script_text_prompt=None):
        """
        Update an existing MagicNoteCriticModel object.

        :param critic_id: The ID of the magic note critic to update.
        :param active: Boolean indicating if the critic is active.
        :param name: The name of the critic.
        :param order_rank: The order rank of the critic.
        :param story_text_prompt: The prompt for story text critiques.
        :param scene_text_prompt: The prompt for scene text critiques.
        :param beat_sheet_prompt: The prompt for beat sheet critiques.
        :param script_text_prompt: The prompt for script text critiques.
        :return: The updated MagicNoteCriticModel object or an error message.
        """
        try:
            # Convert critic_id to ObjectId
            critic_id = ObjectId(critic_id)
        except InvalidId:
            raise GraphQLError("Invalid critic ID provided.")

        try:
            # Retrieve the existing critic
            magic_note_critic = MagicNoteCriticModel.objects.get(id=critic_id)

            # Update fields if provided
            if active is not None:
                magic_note_critic.active = active
            if name:
                magic_note_critic.name = name
            if order_rank is not None:
                magic_note_critic.order_rank = order_rank
            if story_text_prompt:
                magic_note_critic.story_text_prompt = story_text_prompt
            if scene_text_prompt:
                magic_note_critic.scene_text_prompt = scene_text_prompt
            if beat_sheet_prompt:
                magic_note_critic.beat_sheet_prompt = beat_sheet_prompt
            if script_text_prompt:
                magic_note_critic.script_text_prompt = script_text_prompt

            # Set the updated_at field to the current datetime
            magic_note_critic.updated_at = datetime.utcnow()

            # Save the updates
            magic_note_critic.save()

            #refresh data
            magic_note_critic = MagicNoteCriticModel.objects(id=magic_note_critic.id).first()

            MagicNoteService.clear_magic_note_critic_cache(magic_note_critic.id)
            return magic_note_critic
        except DoesNotExist:
            raise GraphQLError("Magic note critic not found.")
        except NotUniqueError:
            raise GraphQLError("Magic note critic with the provided details already exists.")

    @staticmethod
    def delete_magic_note_critic(critic_id):
        """
        Delete an existing MagicNoteCriticModel object.

        :param critic_id: The ID of the magic note critic to delete.
        :return: Success message or an error message.
        """
        try:
            # Convert critic_id to ObjectId
            critic_id = ObjectId(critic_id)
        except InvalidId:
            raise GraphQLError("Invalid critic ID provided.")

        try:
            # Retrieve and delete the critic
            magic_note_critic = MagicNoteCriticModel.objects.get(id=critic_id)
            magic_note_critic.delete()

            MagicNoteService.clear_magic_note_critic_cache(critic_id)

            return True
        except DoesNotExist:
            raise GraphQLError("Magic note critic not found.")

    @staticmethod
    def get_magic_note_critics_statistics(magic_notes_critics: QuerySet):

        total = magic_notes_critics.count()
        active_count = magic_notes_critics.filter(Q(active=True)).count()

        statistics = {}
        statistics['total'] = total
        statistics['active_count'] = active_count
        statistics['inactive_count'] = total - active_count

        return statistics

    @staticmethod
    def list_all_magic_note_critics(name='', activeOnly=False, page=1, limit=None):
        """
        Retrieve a list of MagicNoteCritics with optional filtering by name and active state.

        :param name: Optional filter by critic's name (case-insensitive).
        :param activeOnly: Optional filter by critic's active state.
        :return: A list of MagicNoteCriticModel objects.
        """
        if not limit:
            limit = settings.record_limit

        # Initialize query object
        query = Q()

        # Apply name filter if provided
        if name != '':
            query &= Q(name__icontains=name)

        # Apply active state filter if provided
        if activeOnly:
            query &= Q(active=True)

        statistics = MagicNoteService.get_magic_note_critics_statistics(MagicNoteCriticModel.objects())

        # Retrieve and sort critics based on the query
        critics = MagicNoteCriticModel.objects(query).skip((page - 1) * limit).order_by('name')

        total_records = MagicNoteCriticModel.objects().count()
        pages = (total_records + limit - 1) // limit

        return list(critics), pages, statistics

    @staticmethod
    def get_magic_note_critic_by_id(critic_id):
        """
        Retrieve a MagicNoteCriticModel by its ID.

        :param critic_id: The ID of the magic note critic.
        :return: The MagicNoteCriticModel object or an error message.
        """
        try:
            # Convert critic_id to ObjectId
            critic_id = ObjectId(critic_id)
            # Retrieve the critic
            magic_note_critic = MagicNoteCriticModel.objects.get(id=critic_id)
            return magic_note_critic
        except InvalidId:
            raise GraphQLError("Invalid critic ID provided.")
        except DoesNotExist:
            raise GraphQLError("Magic note critic not found.")

    @staticmethod
    def list_magic_note_critics_by_type(document_type):
        """
        List Magic Note Critics by document type with non-empty prompts.

        :param document_type: The type of document, in CamelCase, such as 'ScriptText'.
        :return: An array of objects containing the magic note critic ID and name.
        """
        # Convert CamelCase to snake_case for the prompt field
        prompt_field = ''.join(['_' + i.lower() if i.isupper() else i for i in document_type]).lstrip('_') + '_prompt'

        # Build the query to filter by the corresponding prompt field and active state
        query = Q(**{prompt_field + '__ne': ''}) & Q(**{prompt_field + '__exists': True}) & Q(active=True)

        # Retrieve and sort critics by order_rank and name
        critics = MagicNoteCriticModel.objects(query).order_by('order_rank', 'name')

        # Return a list of dicts with only ID and name
        return [{'id': str(critic.id), 'name': critic.name} for critic in critics]

    @staticmethod
    def generate_magic_notes(project_id, document_type, document_id, critic_ids=None, user_id=None):
        # Mapping document types to their respective model classes
        document_model_mapping = {
            'StoryText': StoryTextModel,
            'SceneText': SceneTextModel,
            'ScriptText': ScriptTextModel,
            #'BeatSheet': BeatSheetModel
        }

        # Step 1: Load the document object model based on the document_type argument
        model_class = document_model_mapping.get(document_type)
        if not model_class:
            raise ValueError(f"Unsupported document type: {document_type}")

        document = model_class.objects(id=document_id).first()
        if not document:
            raise ValueError("The document does not exist.")

        # Step 2: Make sure the document belongs to the correct project
        if str(document.getProject().id) != str(project_id):
            raise ValueError("Document does not belong to this project")

        # Step 3: Load MagicNoteCriticModel objects if critic_ids is not None
        critics = []
        if critic_ids is not None:
            for critic_id in critic_ids:
                critic = MagicNoteCriticModel.objects(id=critic_id, active=True).first()
                if critic:
                    critics.append(critic)

        # Get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Step 4: Pass everything to the MagicNotePrompter.prompt_magic_notes method
        prompt_data = MagicNotePrompter.prompt_magic_notes(document_type, document, critics, default_llm)

        # Step 5: Compile task metadata and save the agent task
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'magic-note',
            'magic_note_type': 'custom',
            'update_field': 'text_notes',
            'document_type': document_type,
            'document_id': str(document_id),
            'critic_ids': critic_ids
        }

        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, document_type, document_id, prompt_data, task_metadata
        )

        return agent_task.id


    @staticmethod
    def generate_expansive_notes(project_id, document_type, document_id, user_id=None):
        # Mapping document types to their respective model classes
        document_model_mapping = {
            'StoryText': StoryTextModel,
            'SceneText': SceneTextModel,
            #'ScriptText': ScriptTextModel,
            #'BeatSheet': BeatSheetModel
        }

        # Step 1: Load the document object model based on the document_type argument
        model_class = document_model_mapping.get(document_type)
        if not model_class:
            raise ValueError(f"Unsupported document type: {document_type}")

        document = model_class.objects(id=document_id).first()
        if not document:
            raise ValueError("The document does not exist.")

        # Step 2: Make sure the document belongs to the correct project
        if str(document.getProject().id) != str(project_id):
            raise ValueError("Document does not belong to this project")

        # Get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Step 3: Pass everything to the MagicNotePrompter.prompt_magic_notes method
        prompt_data = MagicNotePrompter.prompt_expansive_notes(document_type, document, default_llm)

        # Step 4: Compile task metadata and save the agent task
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'magic-note',
            'magic_note_type': 'expansive',
            'update_field': 'text_notes',
            'document_type': document_type,
            'document_id': str(document_id),
        }

        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, document_type, document_id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def clear_magic_note_critic_cache(magic_note_critic_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append('magic_note_critics_')
        tags_to_clear.append('magic_note_critics_type_')
        tags_to_clear.append(f'magic_note_critic_critic_id:{magic_note_critic_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
