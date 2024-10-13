import unittest
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.AgentTask.AgentTaskModel import AgentTaskModel
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.AgentTask.AgentTaskService import AgentTaskService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.modules.Admin.AdminService import AdminService
import random
from unittest.mock import patch, MagicMock

class TestAgentTask(BaseTestCase):

    def setUp(self):
        super().setUp()

        # Create a project to use for the tests, which also initializes story text
        self.project_id = self.create_project_for_test(self.admin)

        angle_bracket_prompt = PromptTemplateService.register_prompt_template(
            name="angle_bracket_prompt",
            reference_key="angle_bracket_prompt",
            prompt_text="angle_bracket_prompt",
            user_context=self.admin,
        )
        project_profile_prompt = PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text="project_profile_prompt",
            user_context=self.admin,
        )
        story_text_system_role_from_seed = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_from_seed",
            reference_key="story_text_system_role_from_seed",
            prompt_text="story_text_system_role_from_seed",
            user_context=self.admin,
        )
        story_text_user_prompt_from_seed = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_from_seed",
            reference_key="story_text_user_prompt_from_seed",
            prompt_text="story_text_user_prompt_from_seed",
            user_context=self.admin,
        )
        AdminService.update_platform_setting('prompts.generateStoryFromSeed', {"system_role": str(story_text_system_role_from_seed.id), "user_prompt": str(story_text_user_prompt_from_seed.id)})

        #Do a call to generate new story text, which creates an agent task
        self.run_generate_story_from_seed()

    def create_project_for_test(self, user, title="Test Project", text_seed="Test seed text"):
        # Define the metadata input as a GraphQL object, not a JSON string
        metadata_input = "{ genre: \"Science Fiction\" }"
        mutation = f'''
          mutation {{
            createProject(title: "{title}", metadata: {metadata_input}, textSeed: "{text_seed}") {{
              project {{
                id
                title
                metadata
              }}
            }}
          }}
        '''
        response = self.query_admin(mutation)
        assert 'errors' not in response, f"GraphQL Error: {response.get('errors')}"
        project_id = response["data"]["createProject"]["project"]["id"]
        return project_id

    @patch('main.libraries.QueueHelper.pika')
    def run_generate_story_from_seed(self, mock_pika):
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
        response = self.query_admin(mutation)

        data = response['data']['generateStoryFromSeed']

        # Use assert statement instead of cls.assertIsNotNone()
        assert data['agentTaskId'] is not None, "agentTaskId is None."

        # Additional assertion to check if the AgentTask object was created
        agent_task = AgentTaskModel.objects.get(id=data['agentTaskId'])

        # Use assert statement instead of cls.assertIsNotNone()
        assert agent_task is not None, "Agent task was not created in the database."

        self.agent_task_id = data['agentTaskId']


    def test_get_agent_task_by_id(self):
        query = f"""
        query {{
            agentTaskById(id: "{self.agent_task_id}") {{
                id
                status
                documentType
                documentId
                llmModel
                maxInputTokens
                maxOutputTokens
                temperature
                systemRole
                promptText
                metadata
            }}
        }}
        """
        response = self.query_admin(query)

        data = response['data']['agentTaskById']
        self.assertEqual(data['id'], self.agent_task_id)

    def test_get_agent_task_by_id_for_project(self):
        query = f"""
        query {{
            agentTaskByIdForProject(id: "{self.agent_task_id}", projectId: "{self.project_id}") {{
                id
                status
                documentType
                documentId
            }}
        }}
        """

        response = self.query_admin(query)
        data = response['data']['agentTaskByIdForProject']
        self.assertEqual(data['id'], self.agent_task_id)


    def test_list_agent_tasks(self):

        # Run the `generateStoryFromSeed` mutation multiple times to create several tasks
        for i in range(3):
            self.run_generate_story_from_seed()

        # Perform the GraphQL query to list all agent tasks
        query = f"""
        query {{
            listAgentTasks(status: null, documentType: null, documentId: null, sort: "desc", limit: 10) {{
                agentTasks {{
                    id
                    status
                    documentType
                    documentId
                    llmModel
                }}
            }}
        }}
        """
        response = self.query_admin(query)
        data = response['data']['listAgentTasks']['agentTasks']

        # Check if the correct number of tasks are returned
        assert len(data) == 4, f"Expected 4 tasks, but got {len(data)}."

        # Check if the tasks match the expected schema
        for task in data:
            assert 'id' in task and isinstance(task['id'], str)
            assert 'status' in task and isinstance(task['status'], str)
            assert 'documentType' in task and isinstance(task['documentType'], (str, type(None)))

    def test_list_agent_tasks_by_project(self):

        # Run the `generateStoryFromSeed` mutation multiple times to create several tasks
        for i in range(3):
            self.run_generate_story_from_seed()

        # Perform the GraphQL query to list all agent tasks
        query = f"""
        query {{
            listAgentTasksByProject(projectId: "{self.project_id}", status: null, documentType: null, documentId: null, sort: "desc", limit: 10) {{
                agentTasks {{
                    id
                    status
                    documentType
                    documentId
                    llmModel
                }}
            }}
        }}
        """
        response = self.query_admin(query)
        data = response['data']['listAgentTasksByProject']['agentTasks']

        # Check if the correct number of tasks are returned
        assert len(data) == 4, f"Expected 4 tasks, but got {len(data)}."

        # Check if the tasks match the expected schema
        for task in data:
            assert 'id' in task and isinstance(task['id'], str)
            assert 'status' in task and isinstance(task['status'], str)
            assert 'documentType' in task and isinstance(task['documentType'], (str, type(None)))

    def test_update_agent_task(self):
        # Generate random inputs for the update fields
        input_tokens_used = random.randint(50, 1000)
        output_tokens_used = random.randint(20, 1000)
        agent_results = "Generated content from LLM"
        agent_id = "agent_001"
        status = "completed"
        status_message = "Task processed successfully"

        mutation = f"""
        mutation {{
            updateAgentTask(id: "{self.agent_task_id}", status: "{status}", statusMessage: "{status_message}", inputTokensUsed: {input_tokens_used}, outputTokensUsed: {output_tokens_used}, agentResults: "{agent_results}", agentId: "{agent_id}") {{
                agentTask {{
                    id
                    status
                    statusMessage
                    inputTokensUsed
                    outputTokensUsed
                    agentResults
                    agentId
                }}
            }}
        }}
        """
        response = self.query_admin(mutation)

        data = response['data']['updateAgentTask']['agentTask']

        # Check if the agent task has been updated correctly
        self.assertEqual(data['id'], self.agent_task_id)
        self.assertEqual(data['status'], status)
        self.assertEqual(data['statusMessage'], status_message)
        self.assertEqual(data['inputTokensUsed'], input_tokens_used)
        self.assertEqual(data['outputTokensUsed'], output_tokens_used)
        self.assertEqual(data['agentResults'], agent_results)
        self.assertEqual(data['agentId'], agent_id)

    @patch('main.libraries.QueueHelper.pika')
    def test_reset_agent_task(self, mock_pika):
        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Set up the mutation for resetting an agent task
        mutation = f"""
        mutation {{
            resetAgentTask(id: "{self.agent_task_id}") {{
                success
            }}
        }}
        """
        response = self.query_admin(mutation)
        data = response['data']['resetAgentTask']

        # Check if the reset operation was successful
        self.assertIsNotNone(data['success'])

        # Optionally, retrieve the task from the database and check if it has been reset
        reset_task = AgentTaskModel.objects.get(id=self.agent_task_id)
        self.assertEqual(reset_task.status, 'pending')
        self.assertIsNone(reset_task.status_message)
        self.assertIsNone(reset_task.input_tokens_used)
        self.assertIsNone(reset_task.output_tokens_used)
        self.assertIsNone(reset_task.agent_results)
        self.assertIsNone(reset_task.agent_id)
        self.assertIsNone(reset_task.errors)
        self.assertIsNone(reset_task.processing_at)

    def test_delete_and_generate_new_agent_task(self):
        # Set up the mutation for deleting an agent task
        agent_task_id = self.agent_task_id
        mutation = f"""
        mutation {{
            deleteAgentTask(id: "{agent_task_id}" ) {{
                success
            }}
        }}
        """

        # Perform the deletion mutation
        response = self.query_admin(mutation)

        data_delete = response['data']['deleteAgentTask']

        # Check if the deletion operation was successful
        self.assertIsNotNone(data_delete['success'])

        # Check if the agent task has been deleted from the database
        deleted_task = AgentTaskModel.objects(id=self.agent_task_id).first()
        self.assertIsNone(deleted_task)

        # Generate a new agent task
        self.run_generate_story_from_seed()

        # Check if a new agent task was created and has a different ID
        self.assertNotEqual(self.agent_task_id, agent_task_id, "New agent task ID should be different from the deleted task ID.")


    def tearDown(self):
        super().tearDown()
        # Cleanup - delete the test data from the database
        ProjectModel.objects.delete()
        StoryTextModel.objects.delete()
        AgentTaskModel.objects.delete()
        PromptTemplateModel.objects.delete()
