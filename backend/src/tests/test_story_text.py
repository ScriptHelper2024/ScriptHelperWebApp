import unittest
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from unittest.mock import patch, MagicMock
from main.modules.Admin.AdminService import AdminService


class TestStoryText(BaseTestCase):

    def setUp(self):
        super().setUp()

        # Create a project to use for the tests
        self.project_id = self.create_project_for_test()


        project_profile_prompt = PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text="project_profile_prompt",
            user_context=self.user_1,
        )
        angle_bracket_prompt = PromptTemplateService.register_prompt_template(
            name="angle_bracket_prompt",
            reference_key="angle_bracket_prompt",
            prompt_text="angle_bracket_prompt",
            user_context=self.user_1,
        )
        story_text_system_role_from_seed = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_from_seed",
            reference_key="story_text_system_role_from_seed",
            prompt_text="story_text_system_role_from_seed",
            user_context=self.user_1,
        )
        story_text_user_prompt_from_seed = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_from_seed",
            reference_key="story_text_user_prompt_from_seed",
            prompt_text="story_text_user_prompt_from_seed",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateStoryFromSeed', {"system_role": str(story_text_system_role_from_seed.id), "user_prompt": str(story_text_system_role_from_seed.id)})

        story_text_system_role_with_notes = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_with_notes",
            reference_key="story_text_system_role_with_notes",
            prompt_text="story_text_system_role_with_notes",
            user_context=self.user_1,
        )
        story_text_user_prompt_with_notes = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_with_notes",
            reference_key="story_text_user_prompt_with_notes",
            prompt_text="story_text_user_prompt_with_notes",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateStoryWithNotes', {"system_role": str(story_text_system_role_with_notes.id), "user_prompt": str(story_text_user_prompt_with_notes.id)})


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

    def test_get_story_text(self):
        # Setup
        story_text_id = StoryTextService.init_story_text(self.project_id, self.user_1)
        # Test if the story text can be retrieved
        query = f'''
        query {{
            getStoryText(textId: "{story_text_id}", projectId: "{self.project_id}") {{
                id
                textContent
            }}
        }}
        '''
        response = self.query_user_1(query)

        data = response['data']['getStoryText']
        self.assertEqual(data['id'], str(story_text_id))

    def test_list_story_versions(self):
        # Setup - create multiple story text versions for the test project
        initial_story_text_id = StoryTextService.init_story_text(self.project_id, self.user_1)
        for _ in range(3):  # Create 3 versions
            StoryTextService.create_new_version(
                source_text=StoryTextModel.objects.get(id=initial_story_text_id),
                user=self.user_1,
                version_type="edit",
                text_seed="New version seed",
                text_notes="New version notes",
                text_content="New version content"
            )

        # Perform the GraphQL query to list all story versions
        query = f'''
        query {{
            listStoryVersions(projectId: "{self.project_id}") {{
                id
                versionType
        		versionNumber
        		versionLabel
        		llmModel
        		createdAt
            }}
        }}
        '''
        response = self.query_user_1(query)
        # Assert that the response is successful and the data is correct

        data = response['data']['listStoryVersions']
        self.assertEqual(len(data), 4)  # Initial + 3 new versions
        self.assertEqual(data[0]['versionNumber'], 1)  # Check the version number of the first version

    def test_update_story_version_label(self):
        # Setup - create a story text version
        story_text_id = StoryTextService.init_story_text(self.project_id, self.user_1)

        # Perform the GraphQL mutation to update the version label
        new_version_label = "Revised Version"
        mutation = f'''
        mutation {{
            updateStoryVersionLabel(projectId: "{self.project_id}", storyTextId: "{story_text_id}", versionLabel: "{new_version_label}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the version label was updated

        data = response['data']['updateStoryVersionLabel']
        self.assertTrue(data['success'])

        # Additional assertion to verify the version label was updated in the database
        updated_story_text = StoryTextModel.objects.get(id=story_text_id)
        self.assertEqual(updated_story_text.version_label, new_version_label, "The version label was not updated correctly.")

    def test_update_story_text(self):
        # Setup - create a story text version
        story_text_id = StoryTextService.init_story_text(self.project_id, self.user_1)

        # Perform the GraphQL mutation to update the story text
        update_fields = {
            "text_seed": "New seed text",
            "text_notes": "Some insightful notes",
            "text_content": "The actual content of the story text",
        }
        mutation = f'''
        mutation {{
            updateStoryText(projectId: "{self.project_id}", textId: "{story_text_id}", textSeed: "{update_fields['text_seed']}", textNotes: "{update_fields['text_notes']}", textContent: "{update_fields['text_content']}") {{
                storyText {{
                    id
                    textSeed
                    textNotes
                    textContent
                }}
            }}
        }}
        '''
        response = self.query_user_1(mutation)
        # Assert that the response is successful and the story text was updated

        story_text = response['data']['updateStoryText']['storyText']
        self.assertEqual(story_text['textSeed'], update_fields['text_seed'])
        self.assertEqual(story_text['textNotes'], update_fields['text_notes'])
        self.assertEqual(story_text['textContent'], update_fields['text_content'])

        # Additional assertion to verify a new story text version was created
        versions_after_update = StoryTextModel.objects(project_id=self.project_id).order_by('-version_number')
        self.assertGreater(len(versions_after_update), 1, "No new version was created.")
        latest_version = versions_after_update.first()
        self.assertEqual(latest_version.text_seed, update_fields['text_seed'], "Text seed was not updated.")
        self.assertEqual(latest_version.text_notes, update_fields['text_notes'], "Text notes were not updated.")
        self.assertEqual(latest_version.text_content, update_fields['text_content'], "Text content was not updated.")
        self.assertEqual(str(latest_version.created_by.id), str(self.user_1.id), "Created by user is incorrect.")


    def test_rebase_story_text(self):
        # Setup - create a story text version and a few edits
        story_text_id = StoryTextService.init_story_text(self.project_id, self.user_1)
        # Assume create_new_version creates new versions with incremented version_number
        for _ in range(2):
            StoryTextService.create_new_version(
                source_text=StoryTextModel.objects.get(id=story_text_id),
                user=self.user_1,
                version_type="edit",
                text_seed="Another version",
                text_notes="Notes for another version",
                text_content="Content for another version"
            )

        # Perform the GraphQL mutation to rebase to the latest version
        mutation = f'''
        mutation {{
            rebaseStoryText(projectId: "{self.project_id}", storyTextId: "{story_text_id}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the rebase was done

        data = response['data']['rebaseStoryText']
        self.assertTrue(data['success'])

        # Additional assertion to verify only one version remains after the rebase
        remaining_versions = StoryTextModel.objects(project_id=self.project_id)

        self.assertEqual(remaining_versions.count(), 1, "More than one version remains after rebase.")
        rebased_version = remaining_versions.first()
        self.assertEqual(rebased_version.version_type, 'base', "Rebased version is not set as 'base'.")
        self.assertEqual(rebased_version.version_number, 1, "Rebased version number is not set as 1.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_story_from_seed(self, mock_pika):
        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Find the first StoryTextModel entry with the associated project_id
        story_text = StoryTextModel.objects(project_id=self.project_id).first()
        if not story_text:
            raise Exception("No StoryText found for the given project_id.")

        mutation = f'''
            mutation {{
                generateStoryFromSeed(projectId: "{self.project_id}", textId: "{story_text.id}") {{
                    agentTaskId
                }}
            }}
        '''
        response = self.query_user_1(mutation)
        data = response['data']['generateStoryFromSeed']

        # Use assert statement instead of cls.assertIsNotNone()
        assert data['agentTaskId'] is not None, "agentTaskId is None."


    @patch('main.libraries.QueueHelper.pika')
    def test_generate_story_with_notes(self, mock_pika):
        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Find the first StoryTextModel entry with the associated project_id
        story_text = StoryTextModel.objects(project_id=self.project_id).first()
        if not story_text:
            raise Exception("No StoryText found for the given project_id.")

        mutation = f'''
            mutation {{
                generateStoryWithNotes(projectId: "{self.project_id}", textId: "{story_text.id}") {{
                    agentTaskId
                }}
            }}
        '''
        response = self.query_user_1(mutation)
        data = response['data']['generateStoryWithNotes']

        # Use assert statement instead of cls.assertIsNotNone()
        assert data['agentTaskId'] is not None, "agentTaskId is None."

    def tearDown(self):
        super().tearDown()
        # Cleanup - delete the test story texts, projects and user from the database
        StoryTextModel.objects.delete()
        ProjectModel.objects.delete()
        PromptTemplateModel.objects.delete()
