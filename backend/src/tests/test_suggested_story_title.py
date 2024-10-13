# test_suggested_story_title.py
import unittest
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.User.UserModel import UserModel
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleService import SuggestedStoryTitleService
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleModel import SuggestedStoryTitleModel
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from unittest.mock import patch, MagicMock
import json
from main.modules.Admin.AdminService import AdminService


class TestSuggestedStoryTitle(BaseTestCase):

    def setUp(self):
        super().setUp()

        # Create a project to use for the tests
        self.project_id = self.create_project_for_test()

    def create_project_for_test(self, title="Test Project"):
        # Define the metadata input as a GraphQL object, not a JSON string
        metadata_input = "{ genre: \"Science Fiction\" }"
        mutation = f'''
          mutation {{
            createProject(title: "{title}", metadata: {metadata_input}) {{
              project {{
                id
                title
                metadata
              }}
            }}
          }}
        '''
        response = self.query_user_1(mutation)
        assert 'errors' not in response, f"GraphQL Error: {response.get('errors')}"
        project_id = response["data"]["createProject"]["project"]["id"]
        return project_id

    def create_suggestion_for_test(self, title="A New Title"):
        # Create a title suggestion for testing individual operations
        mutation = f'''
        mutation {{
            createTitleSuggestion(projectId: "{self.project_id}", title: "{title}") {{
                success
                suggestion {{
                    id
                    title
                    createdAt
                }}
            }}
        }}
        '''

        response = self.query_user_1(mutation)
        data = response['data']['createTitleSuggestion']
        return data['suggestion']['id']  # Store suggestion ID for use in tests

    def test_create_title_suggestion(self):
        # GraphQL mutation for creating a title suggestion
        mutation = f'''
        mutation {{
            createTitleSuggestion(projectId: "{str(self.project_id)}", title: "My Suggested Title") {{
                success
                suggestion {{
                    id
                    title
                    createdAt
                }}
            }}
        }}
        '''
        response = self.query_user_1(mutation)
        data = response['data']['createTitleSuggestion']

        self.assertTrue(data['success'])
        self.assertEqual(data['suggestion']['title'], "My Suggested Title")

    def test_list_title_suggestions(self):
        # First, create a title suggestion to ensure there's at least one
        self.test_create_title_suggestion()

        # GraphQL query for listing title suggestions
        query = f'''
        query {{
            listTitleSuggestions(projectId: "{str(self.project_id)}") {{
                id
                title
                createdAt
            }}
        }}
        '''
        response = self.query_user_1(query)
        data = response['data']['listTitleSuggestions']

        self.assertTrue(len(data) > 0)

    def test_get_title_suggestion_by_id(self):
        suggestion_id = self.create_suggestion_for_test()

        # GraphQL query for getting a title suggestion by ID
        query = f'''
        query {{
            getTitleSuggestionById(projectId: "{str(self.project_id)}", suggestionId: "{suggestion_id}") {{
                id
                title
                createdAt
            }}
        }}
        '''
        response = self.query_user_1(query)

        data = response['data']['getTitleSuggestionById']
        self.assertEqual(data['id'], suggestion_id)
        self.assertEqual(data['title'], "A New Title")

    def test_delete_suggestion(self):
        suggestion_id = self.create_suggestion_for_test()

        # GraphQL mutation for deleting a title suggestion
        mutation = f'''
        mutation {{
            deleteTitleSuggestion(projectId: "{str(self.project_id)}", suggestionId: "{suggestion_id}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        data = response['data']['deleteTitleSuggestion']

        self.assertTrue(data['success'])

        # Verify that the suggestion has been deleted
        suggestion = SuggestedStoryTitleModel.objects(id=suggestion_id).first()
        self.assertIsNone(suggestion)

    def test_delete_all_suggestions(self):
        # Ensure there's at least one suggestion before attempting to delete all
        self.test_create_title_suggestion()

        # GraphQL mutation for deleting all title suggestions in a project
        mutation = f'''
        mutation {{
            deleteAllTitleSuggestions(projectId: "{str(self.project_id)}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        data = response['data']['deleteAllTitleSuggestions']

        self.assertTrue(data['success'])

        # Verify that all suggestions have been deleted
        suggestions = SuggestedStoryTitleModel.objects(project_id=self.project_id).all()
        self.assertEqual(len(suggestions), 0)


    def test_apply_suggestion(self):
        # Ensure there is a suggestion to apply
        suggestion_id = self.create_suggestion_for_test('New Suggestion 123')

        # GraphQL mutation for applying a title suggestion
        mutation = f'''
        mutation {{
            applyTitleSuggestion(projectId: "{str(self.project_id)}", suggestionId: "{suggestion_id}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        data = response['data']['applyTitleSuggestion']
        self.assertTrue(data['success'])

        # Verify that the project's title has been updated
        updated_project = ProjectModel.objects.get(id=self.project_id)
        self.assertEqual(updated_project.title, "New Suggestion 123")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_suggestion(self, mock_pika):
        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        angle_bracket_prompt = PromptTemplateService.register_prompt_template(
            name="angle_bracket_prompt",
            reference_key="angle_bracket_prompt",
            prompt_text="angle_bracket_prompt",
            user_context=self.user_1,
        )
        suggest_title_system_role = PromptTemplateService.register_prompt_template(
            name="suggested_title_system_role_make_suggestion",
            reference_key="suggested_title_system_role_make_suggestion",
            prompt_text="suggested_title_system_role_make_suggestion",
            user_context=self.user_1,
        )
        suggest_title_prompt_text = PromptTemplateService.register_prompt_template(
            name="suggested_title_user_prompt_make_suggestion",
            reference_key="suggested_title_user_prompt_make_suggestion",
            prompt_text="suggested_title_user_prompt_make_suggestion",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateTitleSuggestion', {"system_role": str(suggest_title_system_role.id), "user_prompt": str(suggest_title_prompt_text.id)})

        # Create a new story text with content greater than 200 characters
        new_story_text_content = "This is a new version of the story text. " * 10  # This ensures the text is over 200 characters.
        project = ProjectModel.objects(id=self.project_id).first()
        latest_story_text_id = project.getLatestStoryTextId()
        original_story_text = StoryTextModel.objects(id=latest_story_text_id).first()

        # Use the StoryTextService to create a new manual version
        new_story_text = StoryTextService.create_new_version(
            source_text=original_story_text,
            user=self.user_1,
            version_type='edit',
            text_content=new_story_text_content
        )

        mutation = f'''
            mutation {{
                generateTitleSuggestion(projectId: "{str(self.project_id)}", storyTextId: "{str(new_story_text.id)}") {{
                    agentTaskId
                }}
            }}
        '''
        response = self.query_user_1(mutation)

        data = response['data']['generateTitleSuggestion']

        # Use assert statement instead of cls.assertIsNotNone()
        assert data['agentTaskId'] is not None, "agentTaskId is None."

    def tearDown(self):
        super().tearDown()
        # Cleanup - delete the test story texts, projects and user from the database
        SuggestedStoryTitleModel.objects.delete()
        ProjectModel.objects.delete()
        UserModel.objects.delete()
        PromptTemplateModel.objects.delete()
