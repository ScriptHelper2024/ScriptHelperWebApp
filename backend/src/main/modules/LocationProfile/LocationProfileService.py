from .LocationProfileModel import LocationProfileModel
from .LocationProfilePrompter import LocationProfilePrompter
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

class LocationProfileService:

    # Create an observable instance for the service
    events = Observable()

    @staticmethod
    def create_location_profile(project_id, user, name, text_seed=None, location_order_after=None):
        """
        Create a new LocationProfileModel object with a unique location key.

        :param project_id: The ID of the project.
        :param user: The user creating the location text.
        :param name: The name of the location.
        :param text_seed: The seed text for the location (optional).
        :param location_order_after: The desired position of the location in the ordering (optional).
        :return: The newly created LocationProfileModel object.
        """
        # Create new LocationProfileModel object
        location_profile = LocationProfileModel(
            project_id=ObjectId(project_id),
            created_by=user,
            name=name,
            text_seed=text_seed,
            version_type='base',
            version_number=1,
            location_key=uuid.uuid4(),
            created_at=datetime.utcnow()
        )

        if location_order_after is not None:
            # Place the new location after the specified location order
            preceding_location = LocationProfileModel.objects(
                project_id=ObjectId(project_id),
                location_order__lte=location_order_after
            ).order_by('-location_order').first()
            if preceding_location:
                location_order = preceding_location.location_order + 1
            else:
                location_order = location_order_after
            location_profile.location_order = location_order

            # Increment location_order for subsequent locations
            subsequent_locations = LocationProfileModel.objects(
                project_id=ObjectId(project_id),
                location_order__gte=location_order
            ).update(inc__location_order=1)
        else:
            # Place the new location at the end
            highest_order_location = LocationProfileModel.objects(
                project_id=ObjectId(project_id)
            ).order_by('-location_order').first()
            location_profile.location_order = (highest_order_location.location_order + 1) if highest_order_location else 1

        location_profile.save()

        #refresh data
        location_profile = LocationProfileModel.objects(id=location_profile.id).first()

        #trigger events
        LocationProfileService.events.notify(Event('location_created', {'location_profile': location_profile}))
        LocationProfileService.clear_location_profile_cache(project_id)

        return location_profile

    @staticmethod
    def list_project_locations(project_id):
        """
        Return a dictionary of the latest versions of locations related to the project.

        :param project_id: The ID of the project.
        :return: A list of dictionaries containing location details.
        """
        locations = LocationProfileModel.objects(project_id=ObjectId(project_id)).order_by('location_order')
        unique_locations = {}

        for location in locations:
            key = str(location.location_key)
            try:
                created_by_id = str(location.created_by.id) if location.created_by else None
            except Exception:
                # Log the issue and proceed with created_by as None
                #log_message('error', f"Error resolving created_by field for location_key {key}")
                created_by_id = None

            if key not in unique_locations:
                unique_locations[key] = {
                    'id': str(location.id),
                    'project_id': str(location.project_id.id),
                    'location_key': key,
                    'version_number': location.version_number,
                    'version_type': location.version_type,
                    'name': location.name,
                    'text_seed': location.text_seed,
                    'created_at': location.created_at,
                    'created_by': created_by_id,
                    'location_order': location.location_order,
                    'location_count': location.location_count
                }
            elif location.version_number > unique_locations[key]['version_number']:
                unique_locations[key].update({
                    'id': str(location.id),
                    'project_id': str(location.project_id.id),
                    'version_number': location.version_number,
                    'version_type': location.version_type,
                    'name': location.name,
                    'text_seed': location.text_seed,
                    'created_at': location.created_at,
                    'created_by': created_by_id,
                    'location_order': location.location_order,
                    'location_count': location.location_count
                })

        #Sort locations by their location_order
        sorted_locations = sorted(unique_locations.values(), key=lambda x: x['location_order'])
        return sorted_locations

    @staticmethod
    def delete_location(location_key):
        """
        Delete all versions of a location associated with the provided location_key.
        Also delete any associated beat sheets.

        :param location_key: The UUID key of the location to delete.
        """
        try:
            if not isinstance(location_key, uuid.UUID):
                location_key = uuid.UUID(location_key)

            get_location = LocationProfileModel.objects(location_key=location_key).first()
            if get_location:
                project_id = str(get_location.project_id.id)

                # Delete all location text versions that match the location_key
                LocationProfileModel.objects(location_key=location_key).delete()

                #trigger events -- since the location is deleted the only data we can pass really is the location_key
                LocationProfileService.events.notify(Event('location_deleted', {'location_key': location_key, 'project_id': project_id}))
                LocationProfileService.clear_location_profile_cache(project_id)

        except (ValueError, InvalidId) as e:
            raise ValueError(f"Invalid location key: {e}")

    @staticmethod
    def delete_all_locations(project_id):
        """
        Delete all locations associated with a project.
        Also delete any associated beat sheets by looping through each location.

        :param project_id: The ID of the project whose locations are to be deleted.
        """
        try:
            project_id_obj = ObjectId(project_id)
            # Find all unique location keys within the project
            unique_location_keys = LocationProfileModel.objects(project_id=project_id_obj).distinct('location_key')

            # Loop through each unique location key and delete the corresponding locations
            for location_key in unique_location_keys:
                LocationProfileService.delete_location(location_key)
        except (InvalidId) as e:
            raise ValueError(f"Invalid project_id: {e}")

    @staticmethod
    def get_location_profile(text_id=None, location_key=None, version_number=None):
        """
        Load a location text by text ID or by location key and optional version number.

        :param text_id: The ID of the location text.
        :param location_key: The UUID key of the location.
        :param version_number: The specific version number to retrieve.
        :return: The requested LocationProfileModel document.
        """
        try:
            if text_id:
                oid = ObjectId(text_id)
                return LocationProfileModel.objects(id=oid).first()
            elif location_key:
                if not isinstance(location_key, uuid.UUID):
                    location_key = uuid.UUID(location_key)
                if version_number is not None:
                    return LocationProfileModel.objects(location_key=location_key, version_number=version_number).first()
                else:
                    return LocationProfileModel.objects(location_key=location_key).order_by('-version_number').first()
            else:
                raise ValueError("Either text_id or location_key must be provided.")
        except (ValueError) as e:
            raise ValueError(f"Invalid identifier: {e}")

    @staticmethod
    def list_location_versions(location_key):
        """
        Retrieve a list of all location text versions by location key.

        :param location_key: The unique key of the location.
        :return: A list of location text versions with selected fields, sorted by version number.
        """
        try:
            if not isinstance(location_key, uuid.UUID):
                location_key = uuid.UUID(location_key)
            versions = LocationProfileModel.objects(location_key=location_key).order_by('version_number')
            version_list = []
            for version in versions:
                try:
                    created_by_id = str(version.created_by.id) if version.created_by else None
                except Exception:
                    # Log the issue and proceed with created_by as None
                    #log_message('error', f"Error resolving created_by field for location_key {key}")
                    created_by_id = None
                version_list.append({
                    'id': str(version.id),
                    'version_type': version.version_type,
                    'version_number': version.version_number,
                    'source_version_number': version.source_version.version_number if version.source_version else None,
                    'version_label': version.version_label,
                    'location_count': version.location_count,
                    'location_key': version.location_key,
                    'location_order': version.location_order,
                    'name': version.name,
                    'text_seed': version.text_seed,
                    'llm_model': version.llm_model,
                    'created_at': version.created_at,  # Format for readability
                    'created_by': created_by_id
                })
            return version_list
        except (ValueError) as e:
            raise ValueError(f"Invalid location key: {e}")

    @staticmethod
    def create_new_version(source_text, user, version_type, name=None, text_seed=None, text_notes=None, text_content=None, llm_model=None):
        """
        Creates a new version of location text based on the source text.

        :param source_text: The source LocationProfileModel object to base the new version on.
        :param user: The user object who is creating the new version.
        :param version_type: The version type for the new version (e.g., 'edit', 'note', 'seed').
        :param text_seed: Optional seed text for the new version.
        :param text_notes: Optional notes for the new version.
        :param text_content: Optional content text for the new version.
        :return: The newly created LocationProfileModel object.
        """
        # Determine the latest version number for the location and increment it
        latest_version = LocationProfileModel.objects(location_key=source_text.location_key).order_by('-version_number').first()
        next_version_number = latest_version.version_number + 1 if latest_version else 1

        # Create the new version
        new_location_profile = LocationProfileModel(
            project_id=source_text.project_id,
            location_key=source_text.location_key,
            version_type=version_type,
            source_version=source_text,
            version_number=next_version_number,
            location_order=source_text.location_order,
            name=name if name is not None else source_text.name,
            text_seed=text_seed if text_seed is not None else source_text.text_seed,
            text_notes=text_notes if text_notes is not None else source_text.text_notes,
            text_content=text_content if text_content is not None else source_text.text_content,
            location_count=len(text_content) if text_content is not None else source_text.location_count,
            llm_model=llm_model if llm_model is not None else source_text.llm_model,
            created_by=user
        )
        new_location_profile.save()

        #refresh data
        new_location_profile = LocationProfileModel.objects(id=new_location_profile.id).first()

        #trigger events
        LocationProfileService.events.notify(Event('location_profile_new_version', {'location_profile': new_location_profile}))
        LocationProfileService.clear_location_profile_cache(new_location_profile.project_id.id)

        return new_location_profile

    @staticmethod
    def rebase_location_profile(location_profile_id=None, location_key=None, version_number=None):
        """
        Rebase to a selected location text version, archiving all other versions.

        :param location_profile_id: The ID of the location text to rebase to.
        :param location_key: The unique key of the location (used if location_profile_id is not provided).
        :param version_number: The version number to rebase to (used if location_key is provided).
        """
        # Find the location text to rebase to
        if location_profile_id:
            new_base = LocationProfileModel.objects(id=location_profile_id).first()
        elif location_key and version_number:
            new_base = LocationProfileModel.objects(location_key=location_key, version_number=version_number).first()
        else:
            raise ValueError("Either location_profile_id or (location_key and version_number) must be provided.")

        if not new_base:
            raise ValueError("Location text to rebase to does not exist.")

        # Rebase the selected version
        new_base.version_type = 'base'
        new_base.version_number = 1  # Reset the version number to 1 for the new base
        new_base.source_version = None
        new_base.save()

        # Archive all other versions by deleting them
        LocationProfileModel.objects(Q(location_key=new_base.location_key) & Q(id__ne=new_base.id)).delete()

        # Save the new base as the only version
        new_base.save()

        # Update the location_order for the remaining location text
        # This is not strictly needed for the rebasing process itself but ensures that
        # the location_order is correct after the operation.
        if location_key:
            locations_to_update = LocationProfileModel.objects(location_key=location_key)
            for index, location in enumerate(locations_to_update.order_by('created_at')):
                location.update(location_order=index + 1)

        #trigger events
        LocationProfileService.events.notify(Event('location_profile_rebased', {'location_profile': new_base}))
        LocationProfileService.clear_location_profile_cache(new_base.project_id.id)

        return True

    @staticmethod
    def update_version_label(location_profile_id=None, location_key=None, version_number=None, version_label=''):
        """
        Updates the version label field without creating a new version.

        :param location_profile_id: The ID of the location text to update the label.
        :param project_id: The ID of the project (used if location_profile_id is not provided).
        :param version_number: The version number to update the label (used if location_profile_id is not provided).
        :param version_label: The new version label.
        """
        # Find the location text to update the label
        if location_profile_id:
            location_profile = LocationProfileModel.objects(id=location_profile_id).first()
        elif location_key and version_number:
            location_profile = LocationProfileModel.objects(location_key=location_key, version_number=version_number).first()
        else:
            raise ValueError("Either location_profile_id or (location_key and version_number) must be provided.")

        if not location_profile:
            raise ValueError("Location text to update the label does not exist.")

        # Update the version label
        location_profile.version_label = version_label
        location_profile.save()

        #trigger events
        LocationProfileService.events.notify(Event('location_profile_version_label', {'location_profile': location_profile}))
        LocationProfileService.clear_location_profile_cache(location_profile.project_id.id)

        return True

    @staticmethod
    def reorder_location(text_id, new_location_order):
        if new_location_order <= 0:
            raise ValueError("new_location_order must be a positive integer.")

        location_profile = LocationProfileModel.objects(id=text_id).first()
        if not location_profile:
            raise ValueError("Location profile not found.")

        max_order = LocationProfileModel.objects(project_id=location_profile.project_id).count()
        new_location_order = min(new_location_order, max_order)  # Adjusted to ensure within valid range

        if location_profile.location_order == new_location_order:
            return  # No change needed

        original_order = location_profile.location_order

        # Determine if moving forward or backward
        if new_location_order > original_order:
            # Moving forward
            LocationProfileModel.objects(
                project_id=location_profile.project_id,
                location_order__gt=original_order,
                location_order__lte=new_location_order
            ).update(dec__location_order=1)
        else:
            # Moving backward
            LocationProfileModel.objects(
                project_id=location_profile.project_id,
                location_order__lt=original_order,
                location_order__gte=new_location_order
            ).update(inc__location_order=1)

        # Update the location_order of the moved location
        location_profile.update(set__location_order=new_location_order)

        # Trigger events and clear cache
        LocationProfileService.events.notify(Event('location_reordered', {
            'location_key': location_profile.location_key,
            'project_id': str(location_profile.project_id.id),
            'new_order': new_location_order
        }))
        LocationProfileService.clear_location_profile_cache(str(location_profile.project_id.id))

        return location_profile

    @staticmethod
    def update_location_profile(text_id, user, name=None, text_seed=None, text_notes=None, text_content=None):
        """
        Update a location text by creating a new version with updated fields.

        :param text_id: The ID of the source location text to update from.
        :param user: The user object who is updating the location text.
        :param name: Optional updated location name.
        :param text_seed: Optional updated seed text.
        :param text_notes: Optional updated notes.
        :param text_content: Optional updated content text.
        :return: The newly created LocationProfileModel document.
        """
        source_text = LocationProfileModel.objects(id=text_id).first()
        if not source_text:
            raise ValueError("The source location text does not exist.")

        # Use the create_new_version method to handle the creation of a new version
        new_location_profile = LocationProfileService.create_new_version(
            source_text=source_text,
            user=user,
            version_type='edit',
            name=name,
            text_seed=text_seed,
            text_notes=text_notes,
            text_content=text_content
        )
        return new_location_profile

    @staticmethod
    def generate_from_seed(project_id, text_id, text_seed=None, user_id=None):
        # Load the location text object
        location_profile = LocationProfileModel.objects(id=text_id).first()
        if not location_profile:
            raise ValueError("The location text does not exist.")
        if str(location_profile.project_id.id) != str(project_id):
            raise ValueError("Location text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = LocationProfilePrompter.prompt_from_seed(location_profile, text_seed, default_llm)

        if text_seed:
            use_seed_text = text_seed
        else:
            use_seed_text = location_profile.text_seed

        # Put together other metadata related to the task, including created_by
        task_metadata = {
            'created_by': user_id,
            'new_version_type': 'new',
            'text_seed': use_seed_text
        }

        # Create the agent task
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id, 'LocationProfile', location_profile.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def generate_with_notes(project_id, text_id, text_notes=None, user_id=None, select_text_start=None, select_text_end=None):
        # Load the location text object
        location_profile = LocationProfileModel.objects(id=text_id).first()
        if not location_profile:
            raise ValueError("The location text does not exist.")
        if str(location_profile.project_id.id) != str(project_id):
            raise ValueError("Location text does not belong to this project")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user_id).default_llm

        # Form the prompt details for our agent
        prompt_data = LocationProfilePrompter.prompt_with_notes(location_profile, text_notes, default_llm, select_text_start, select_text_end)

        if text_notes:
            use_notes_text = text_notes
        else:
            use_notes_text = location_profile.text_notes

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
            project_id, 'LocationProfile', location_profile.id, prompt_data, task_metadata
        )

        return agent_task.id

    @staticmethod
    def clear_location_profile_cache(project_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'project_characters_project_id:{project_id}')
        tags_to_clear.append(f'location_profile_versions_project_id:{project_id}')
        tags_to_clear.append(f'location_profile_project_id:{project_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
