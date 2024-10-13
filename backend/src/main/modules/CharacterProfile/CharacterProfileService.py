from .CharacterProfileModel import CharacterProfileModel
from .CharacterProfilePrompter import CharacterProfilePrompter
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.User.UserModel import UserModel
from bson import ObjectId
from bson.errors import InvalidId
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from datetime import datetime
import uuid
from mongoengine.queryset.visitor import Q
from mongoengine import NotUniqueError
from main.modules.UserPreference.UserPreferenceService import UserPreferenceService
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.libraries.Cache import Cache
from main.libraries.functions import log_message

class CharacterProfileService:

    # Create an observable instance for the service
    events = Observable()

    @staticmethod
    def create_character_profile(project_id, user, name, text_seed=None, character_order_after=None):
        """
        Create a new CharacterProfileModel object with a unique character key.

        :param project_id: The ID of the project.
        :param user: The user creating the character text.
        :param name: The name of the character.
        :param text_seed: The seed text for the character (optional).
        :param character_order_after: The desired position of the character in the ordering (optional).
        :return: The newly created CharacterProfileModel object.
        """
        # Create new CharacterProfileModel object
        character_profile = CharacterProfileModel(
            project_id=ObjectId(project_id),
            created_by=user,
            name=name,
            text_seed=text_seed,
            version_type='base',
            version_number=1,
            character_key=uuid.uuid4(),
            created_at=datetime.utcnow()
        )

        if character_order_after is not None:
            # Place the new character after the specified character order
            preceding_character = CharacterProfileModel.objects(
                project_id=ObjectId(project_id),
                character_order__lte=character_order_after
            ).order_by('-character_order').first()
            if preceding_character:
                character_order = preceding_character.character_order + 1
            else:
                character_order = character_order_after
            character_profile.character_order = character_order

            # Increment character_order for subsequent characters
            subsequent_characters = CharacterProfileModel.objects(
                project_id=ObjectId(project_id),
                character_order__gte=character_order
            ).update(inc__character_order=1)
        else:
            # Place the new character at the end
            highest_order_character = CharacterProfileModel.objects(
                project_id=ObjectId(project_id)
            ).order_by('-character_order').first()
            character_profile.character_order = (highest_order_character.character_order + 1) if highest_order_character else 1

        character_profile.save()

        #refresh data
        character_profile = CharacterProfileModel.objects(id=character_profile.id).first()

        #trigger events
        CharacterProfileService.events.notify(Event('character_created', {'character_profile': character_profile}))
        CharacterProfileService.clear_character_profile_cache(project_id)

        return character_profile

    @staticmethod
    def list_project_characters(project_id):
        """
        Return a dictionary of the latest versions of characters related to the project.

        :param project_id: The ID of the project.
        :return: A list of dictionaries containing character details.
        """
        characters = CharacterProfileModel.objects(project_id=ObjectId(project_id)).order_by('character_order')
        unique_characters = {}

        for character in characters:
            key = str(character.character_key)
            try:
                created_by_id = str(character.created_by.id) if character.created_by else None
            except Exception:
                # Log the issue and proceed with created_by as None
                #log_message('error', f"Error resolving created_by field for character_key {key}")
                created_by_id = None

            if key not in unique_characters:
                unique_characters[key] = {
                    'id': str(character.id),
                    'project_id': str(character.project_id.id),
                    'character_key': key,
                    'version_number': character.version_number,
                    'version_type': character.version_type,
                    'name': character.name,
                    'text_seed': character.text_seed,
                    'created_at': character.created_at,
                    'created_by': created_by_id,
                    'character_order': character.character_order,
                    'character_count': character.character_count
                }
            elif character.version_number > unique_characters[key]['version_number']:
                unique_characters[key].update({
                    'id': str(character.id),
                    'project_id': str(character.project_id.id),
                    'version_number': character.version_number,
                    'version_type': character.version_type,
                    'name': character.name,
                    'text_seed': character.text_seed,
                    'created_at': character.created_at,
                    'created_by': created_by_id,
                    'character_order': character.character_order,
                    'character_count': character.character_count
                })

        #Sort characters by their character_order
        sorted_characters = sorted(unique_characters.values(), key=lambda x: x['character_order'])
        return sorted_characters

    @staticmethod
    def delete_character(character_key):
        """
        Delete all versions of a character associated with the provided character_key.
        Also delete any associated beat sheets.

        :param character_key: The UUID key of the character to delete.
        """
        try:
            if not isinstance(character_key, uuid.UUID):
                character_key = uuid.UUID(character_key)

            get_character = CharacterProfileModel.objects(character_key=character_key).first()
            if get_character:
                project_id = str(get_character.project_id.id)

                # Delete all character text versions that match the character_key
                CharacterProfileModel.objects(character_key=character_key).delete()

                #trigger events -- since the character is deleted the only data we can pass really is the character_key
                CharacterProfileService.events.notify(Event('character_deleted', {'character_key': character_key, 'project_id': project_id}))
                CharacterProfileService.clear_character_profile_cache(project_id)

        except (ValueError, InvalidId) as e:
            raise ValueError(f"Invalid character key: {e}")

    @staticmethod
    def delete_all_characters(project_id):
        """
        Delete all characters associated with a project.
        Also delete any associated beat sheets by looping through each character.

        :param project_id: The ID of the project whose characters are to be deleted.
        """
        try:
            project_id_obj = ObjectId(project_id)
            # Find all unique character keys within the project
            unique_character_keys = CharacterProfileModel.objects(project_id=project_id_obj).distinct('character_key')

            # Loop through each unique character key and delete the corresponding characters
            for character_key in unique_character_keys:
                CharacterProfileService.delete_character(character_key)
        except (InvalidId) as e:
            raise ValueError(f"Invalid project_id: {e}")

    @staticmethod
    def get_character_profile(text_id=None, character_key=None, version_number=None):
        """
        Load a character text by text ID or by character key and optional version number.

        :param text_id: The ID of the character text.
        :param character_key: The UUID key of the character.
        :param version_number: The specific version number to retrieve.
        :return: The requested CharacterProfileModel document.
        """
        try:
            if text_id:
                oid = ObjectId(text_id)
                return CharacterProfileModel.objects(id=oid).first()
            elif character_key:
                if not isinstance(character_key, uuid.UUID):
                    character_key = uuid.UUID(character_key)
                if version_number is not None:
                    return CharacterProfileModel.objects(character_key=character_key, version_number=version_number).first()
                else:
                    return CharacterProfileModel.objects(character_key=character_key).order_by('-version_number').first()
            else:
                raise ValueError("Either text_id or character_key must be provided.")
        except (ValueError) as e:
            raise ValueError(f"Invalid identifier: {e}")

    @staticmethod
    def list_character_versions(character_key):
        """
        Retrieve a list of all character text versions by character key.

        :param character_key: The unique key of the character.
        :return: A list of character text versions with selected fields, sorted by version number.
        """
        try:
            if not isinstance(character_key, uuid.UUID):
                character_key = uuid.UUID(character_key)
            versions = CharacterProfileModel.objects(character_key=character_key).order_by('version_number')
            version_list = []
            for version in versions:
                try:
                    created_by_id = str(version.created_by.id) if version.created_by else None
                except Exception:
                    # Log the issue and proceed with created_by as None
                    #log_message('error', f"Error resolving created_by field for character_key {key}")
                    created_by_id = None
                version_list.append({
                    'id': str(version.id),
                    'version_type': version.version_type,
                    'version_number': version.version_number,
                    'source_version_number': version.source_version.version_number if version.source_version else None,
                    'version_label': version.version_label,
                    'character_count': version.character_count,
                    'character_key': version.character_key,
                    'character_order': version.character_order,
                    'name': version.name,
                    'text_seed': version.text_seed,
                    'llm_model': version.llm_model,
                    'created_at': version.created_at,  # Format for readability
                    'created_by': created_by_id
                })
            return version_list
        except (ValueError) as e:
            raise ValueError(f"Invalid character key: {e}")

    @staticmethod
    def create_new_version(source_text, user, version_type, name=None, text_seed=None, text_notes=None, text_content=None, llm_model=None):
        """
        Creates a new version of character text based on the source text.

        :param source_text: The source CharacterProfileModel object to base the new version on.
        :param user: The user object who is creating the new version.
        :param version_type: The version type for the new version (e.g., 'edit', 'note', 'seed').
        :param text_seed: Optional seed text for the new version.
        :param text_notes: Optional notes for the new version.
        :param text_content: Optional content text for the new version.
        :return: The newly created CharacterProfileModel object.
        """
        # Determine the latest version number for the character and increment it
        latest_version = CharacterProfileModel.objects(character_key=source_text.character_key).order_by('-version_number').first()
        next_version_number = latest_version.version_number + 1 if latest_version else 1

        # Create the new version
        new_character_profile = CharacterProfileModel(
            project_id=source_text.project_id,
            character_key=source_text.character_key,
            version_type=version_type,
            source_version=source_text,
            version_number=next_version_number,
            character_order=source_text.character_order,
            name=name if name is not None else source_text.name,
            text_seed=text_seed if text_seed is not None else source_text.text_seed,
            text_notes=text_notes if text_notes is not None else source_text.text_notes,
            text_content=text_content if text_content is not None else source_text.text_content,
            character_count=len(text_content) if text_content is not None else source_text.character_count,
            llm_model=llm_model if llm_model is not None else source_text.llm_model,
            created_by=user
        )
        new_character_profile.save()

        #refresh data
        new_character_profile = CharacterProfileModel.objects(id=new_character_profile.id).first()

        #trigger events
        CharacterProfileService.events.notify(Event('character_profile_new_version', {'character_profile': new_character_profile}))
        CharacterProfileService.clear_character_profile_cache(new_character_profile.project_id.id)

        return new_character_profile

    @staticmethod
    def rebase_character_profile(character_profile_id=None, character_key=None, version_number=None):
        """
        Rebase to a selected character text version, archiving all other versions.

        :param character_profile_id: The ID of the character text to rebase to.
        :param character_key: The unique key of the character (used if character_profile_id is not provided).
        :param version_number: The version number to rebase to (used if character_key is provided).
        """
        # Find the character text to rebase to
        if character_profile_id:
            new_base = CharacterProfileModel.objects(id=character_profile_id).first()
        elif character_key and version_number:
            new_base = CharacterProfileModel.objects(character_key=character_key, version_number=version_number).first()
        else:
            raise ValueError("Either character_profile_id or (character_key and version_number) must be provided.")

        if not new_base:
            raise ValueError("Character text to rebase to does not exist.")

        # Rebase the selected version
        new_base.version_type = 'base'
        new_base.version_number = 1  # Reset the version number to 1 for the new base
        new_base.source_version = None
        new_base.save()

        # Archive all other versions by deleting them
        CharacterProfileModel.objects(Q(character_key=new_base.character_key) & Q(id__ne=new_base.id)).delete()

        # Save the new base as the only version
        new_base.save()

        # Update the character_order for the remaining character text
        # This is not strictly needed for the rebasing process itself but ensures that
        # the character_order is correct after the operation.
        if character_key:
            characters_to_update = CharacterProfileModel.objects(character_key=character_key)
            for index, character in enumerate(characters_to_update.order_by('created_at')):
                character.update(character_order=index + 1)

        #trigger events
        CharacterProfileService.events.notify(Event('character_profile_rebased', {'character_profile': new_base}))
        CharacterProfileService.clear_character_profile_cache(new_base.project_id.id)

        return True

    @staticmethod
    def update_version_label(character_profile_id=None, character_key=None, version_number=None, version_label=''):
        """
        Updates the version label field without creating a new version.

        :param character_profile_id: The ID of the character text to update the label.
        :param project_id: The ID of the project (used if character_profile_id is not provided).
        :param version_number: The version number to update the label (used if character_profile_id is not provided).
        :param version_label: The new version label.
        """
        # Find the character text to update the label
        if character_profile_id:
            character_profile = CharacterProfileModel.objects(id=character_profile_id).first()
        elif character_key and version_number:
            character_profile = CharacterProfileModel.objects(character_key=character_key, version_number=version_number).first()
        else:
            raise ValueError("Either character_profile_id or (character_key and version_number) must be provided.")

        if not character_profile:
            raise ValueError("Character text to update the label does not exist.")

        # Update the version label
        character_profile.version_label = version_label
        character_profile.save()

        #trigger events
        CharacterProfileService.events.notify(Event('character_profile_version_label', {'character_profile': character_profile}))
        CharacterProfileService.clear_character_profile_cache(character_profile.project_id.id)

        return True

    @staticmethod
    def reorder_character(text_id, new_character_order):
        if new_character_order <= 0:
            raise ValueError("new_character_order must be a positive integer.")

        character_profile = CharacterProfileModel.objects(id=text_id).first()
        if not character_profile:
            raise ValueError("Character profile not found.")

        max_order = CharacterProfileModel.objects(project_id=character_profile.project_id).count()
        new_character_order = min(new_character_order, max_order)  # Adjusted to ensure within valid range

        if character_profile.character_order == new_character_order:
            return  # No change needed

        original_order = character_profile.character_order

        # Moving forward or backward
        if new_character_order > original_order:
            # Moving forward
            CharacterProfileModel.objects(
                project_id=character_profile.project_id,
                character_order__gt=original_order,
                character_order__lte=new_character_order
            ).update(dec__character_order=1)
        else:
            # Moving backward
            CharacterProfileModel.objects(
                project_id=character_profile.project_id,
                character_order__lt=original_order,
                character_order__gte=new_character_order
            ).update(inc__character_order=1)

        # Update the character_order of the moved character
        character_profile.update(set__character_order=new_character_order)

        # Trigger events
        CharacterProfileService.events.notify(Event('character_reordered', {'character_key': character_profile.character_key, 'project_id': str(character_profile.project_id.id), 'new_order': new_character_order}))
        CharacterProfileService.clear_character_profile_cache(str(character_profile.project_id.id))

        return character_profile


    @staticmethod
    def update_character_profile(text_id, user, name=None, text_seed=None, text_notes=None, text_content=None):
        """
        Update a character text by creating a new version with updated fields.

        :param text_id: The ID of the source character text to update from.
        :param user: The user object who is updating the character text.
        :param name: Optional updated character name.
        :param text_seed: Optional updated seed text.
        :param text_notes: Optional updated notes.
        :param text_content: Optional updated content text.
        :return: The newly created CharacterProfileModel document.
        """
        source_text = CharacterProfileModel.objects(id=text_id).first()
        if not source_text:
            raise ValueError("The source character text does not exist.")

        # Use the create_new_version method to handle the creation of a new version
        new_character_profile = CharacterProfileService.create_new_version(
            source_text=source_text,
            user=user,
            version_type='edit',
            name=name,
            text_seed=text_seed,
            text_notes=text_notes,
            text_content=text_content
        )
        return new_character_profile

    @staticmethod
    def generate_from_seed(project_id, text_id, text_seed=None, user_id=None):
        # Load the character text object
        character_profile = CharacterProfileModel.objects(id=text_id).first()
        if not character_profile:
            raise ValueError("The character text does not exist.")
        if str(character_profile.project_id.id) != str(project_id):
            raise ValueError("Character text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = CharacterProfilePrompter.prompt_from_seed(character_profile, text_seed, default_llm)

        if text_seed:
            use_seed_text = text_seed
        else:
            use_seed_text = character_profile.text_seed

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'new',
            'text_seed': use_seed_text
        }

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'CharacterProfile', character_profile.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def generate_with_notes(project_id, text_id, text_notes=None, user_id=None, select_text_start=None, select_text_end=None):
        # Load the character text object
        character_profile = CharacterProfileModel.objects(id=text_id).first()
        if not character_profile:
            raise ValueError("The character text does not exist.")
        if str(character_profile.project_id.id) != str(project_id):
            raise ValueError("Character text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = CharacterProfilePrompter.prompt_with_notes(character_profile, text_notes, default_llm, select_text_start, select_text_end)

        if text_notes:
            use_notes_text = text_notes
        else:
            use_notes_text = character_profile.text_notes

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
            project_id, 'CharacterProfile', character_profile.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def clear_character_profile_cache(project_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'project_characters_project_id:{project_id}')
        tags_to_clear.append(f'character_profile_versions_project_id:{project_id}')
        tags_to_clear.append(f'character_profile_project_id:{project_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
