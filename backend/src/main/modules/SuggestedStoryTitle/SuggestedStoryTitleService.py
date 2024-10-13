from .SuggestedStoryTitleModel import SuggestedStoryTitleModel
from .SuggestedStoryTitlePrompter import SuggestedStoryTitlePrompter
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from bson import ObjectId
from bson.errors import InvalidId
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from mongoengine import DoesNotExist
from main.modules.UserPreference.UserPreferenceService import UserPreferenceService
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from main.libraries.Cache import Cache

class SuggestedStoryTitleService:

    # Create an observable instance for the service
    events = Observable()

    @staticmethod
    def create_suggestion(project_id, user, title):
        """
        Create a new SuggestedStoryTitleModel instance and save it to the database.

        :param project_id: The ID of the project to associate with the title suggestion.
        :param user: The user object creating the title suggestion.
        :param title: The title being suggested.
        :return: The newly created SuggestedStoryTitleModel instance.
        """

        # Ensure that the passed user object is a UserModel instance
        if not isinstance(user, UserModel):
            raise ValueError("The provided user is not a valid UserModel instance")

        # Ensure that the project_id is valid and exists
        if not ProjectModel.objects(id=project_id).first():
            raise ValueError("The provided project_id does not exist")

        # Create a new title suggestion
        suggestion = SuggestedStoryTitleModel(
            project_id=project_id,
            title=title,
            created_by=user
        )

        # Save the suggestion to the database
        suggestion.save()

        #refresh data
        suggestion = SuggestedStoryTitleModel.objects(id=suggestion.id).first()

        #trigger events
        SuggestedStoryTitleService.events.notify(Event('suggested_story_title_created', {'suggestion': suggestion}))
        SuggestedStoryTitleService.clear_suggested_title_cache(project_id)

        return suggestion

    @staticmethod
    def get_suggestion_by_id(suggestion_id, project_id):
        """
        Retrieve a title suggestion by its ID and ensure it belongs to the specified project.

        :param suggestion_id: The ID of the suggestion to retrieve.
        :param project_id: The ID of the project to match.
        :return: The SuggestedStoryTitleModel instance if found, otherwise None.
        """
        try:
            suggestion = SuggestedStoryTitleModel.objects.get(id=suggestion_id, project_id=project_id)
            return suggestion
        except DoesNotExist:
            # No suggestion found with this ID belonging to the project_id
            return None

    @staticmethod
    def list_suggestions_for_project(project_id):
        """
        List all title suggestions for a given project ID.

        :param project_id: The ID of the project to list suggestions for.
        :return: A list of SuggestedStoryTitleModel instances for the project.
        """
        suggestions = SuggestedStoryTitleModel.objects(project_id=project_id).all()
        return list(suggestions)

    @staticmethod
    def delete_suggestion(suggestion_id, project_id):
        """
        Delete a title suggestion by its ID if it belongs to the specified project.

        :param suggestion_id: The ID of the suggestion to delete.
        :param project_id: The ID of the project to match.
        :return: A boolean indicating whether the deletion was successful.
        """
        suggestion = SuggestedStoryTitleModel.objects(
            id=suggestion_id,
            project_id=project_id
        ).first()

        if suggestion:
            #trigger events
            SuggestedStoryTitleService.events.notify(Event('suggested_story_title_deleted', {'suggestion': suggestion}))
            suggestion.delete()

            SuggestedStoryTitleService.clear_suggested_title_cache(project_id)

            return True
        else:
            return False

    @staticmethod
    def delete_all_suggestions(project_id):
        """
        Delete all title suggestions for a given project by individually calling the delete_suggestion method.

        :param project_id: The ID of the project whose suggestions are to be deleted.
        :return: The number of suggestions that were deleted.
        """
        # Fetch all suggestions for the given project
        suggestions = SuggestedStoryTitleModel.objects(project_id=project_id)

        # Initialize the counter for deleted suggestions
        deleted_count = 0

        # Loop through each suggestion and delete using the delete_suggestion method
        for suggestion in suggestions:
            success = SuggestedStoryTitleService.delete_suggestion(suggestion.id, project_id)
            if success:
                # Increment the counter if the deletion was successful
                deleted_count += 1

        return deleted_count

    @staticmethod
    def apply_suggestion(project_id, suggestion_id):
        """
        Apply a title suggestion to the project by updating its title.

        :param project_id: The ID of the project to update.
        :param suggestion_id: The ID of the suggestion to apply.
        :return: A boolean indicating whether the update was successful.
        """
        # Load the suggestion object and validate it
        suggestion = SuggestedStoryTitleModel.objects(id=suggestion_id, project_id=project_id).first()
        if not suggestion:
            raise ValueError("Suggestion does not exist or does not belong to the given project.")

        # Load the project model and update its title
        project = ProjectModel.objects(id=project_id).first()
        if not project:
            raise ValueError("Project does not exist.")

        project.title = suggestion.title
        project.save()  # Save the updated project model

        #trigger events
        SuggestedStoryTitleService.events.notify(Event('suggested_story_title_applied', {'suggestion': suggestion}))
        SuggestedStoryTitleService.clear_suggested_title_cache(project_id)

        return True

    @staticmethod
    def generate_suggestion(project_id, user, story_text_id=None):
        """
        Generates a new title suggestion for a project based on the provided story text.

        :param project_id: The ID of the project for which to generate the suggestion.
        :param user: The user object initiating the suggestion generation.
        :param text_id: Optional ID of the story text to use for generating the suggestion.
        :return: The ID of the created agent task.
        """
        # If text_id is provided, find the story text model by text_id
        if story_text_id:
            story_text = StoryTextModel.objects(id=story_text_id).first()
            if not story_text:
                raise ValueError("The story text does not exist.")
            if str(story_text.project_id.id) != str(project_id):
                raise ValueError("Story text does not belong to this project")
        else:
            # If text_id is None, load the latest story text by version_number with the matching project_id
            story_text = StoryTextModel.objects(project_id=project_id).order_by('-version_number').first()
            if not story_text:
                raise ValueError("No story text exists for this project.")

        # Check that the story_text.text_content field has more than 200 characters
        if not story_text.text_content or len(story_text.text_content) <= 200:
            raise ValueError("The story text content must be more than 200 characters to generate a suggestion.")

        # get the user's preference for the default LLM to use
        default_llm = UserPreferenceService.find_by_user_id(user.id).default_llm

        # Call the prompter class to generate the suggestion prompt
        prompt_data = SuggestedStoryTitlePrompter.prompt_make_suggestion(story_text, default_llm)

        # Prepare the task metadata, setting 'created_by' to the user ID and including the story text id
        task_metadata = {
            'created_by': str(user.id),
            'story_text_id': str(story_text.id)
        }

        # Create the agent task, setting the document type to "SuggestedStoryTitle"
        agent_task = AgentTaskService.new_agent_task_with_prompt(
            project_id=project_id,
            document_type='SuggestedStoryTitle',
            document_id=project_id,
            prompt_data=prompt_data,
            metadata=task_metadata
        )

        # Return the ID of the created agent task
        return str(agent_task.id)

    @staticmethod
    def clear_suggested_title_cache(project_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append(f'title_suggestions_project_id:{project_id}')
        tags_to_clear.append(f'title_suggestion_project_id:{project_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
