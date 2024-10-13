import unittest
import json
from main.config.db import initialize_db
from main.app import create_app
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel
from main.modules.MagicNote.MagicNoteCriticModel import MagicNoteCriticModel
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.Admin.AdminService import AdminService


class TestMagicNote(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Mock the database
        mock_db_uri = 'mongodb://localhost'
        initialize_db(mock_db_uri, reconnect=True)

        cls.app = create_app()
        cls.client = cls.app.test_client()

        # Register and authenticate a user, setting them as an admin.
        cls.register_and_authenticate_user()

        cls.project_id = cls.create_project_for_test()

        project_profile_prompt = PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text="project_profile_prompt",
            user_context=cls.user_model,
        )

        #magic note templates
        story_text_system_role_magic_notes = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_magic_notes",
            reference_key="story_text_system_role_magic_notes",
            prompt_text="story_text_system_role_magic_notes",
            user_context=cls.user_model,
        )
        story_text_user_prompt_magic_notes = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_magic_notes",
            reference_key="story_text_user_prompt_magic_notes",
            prompt_text="story_text_user_prompt_magic_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateMagicNotes.story_text', {"system_role": str(story_text_system_role_magic_notes.id), "user_prompt": str(story_text_user_prompt_magic_notes.id)})

        scene_text_system_role_magic_notes = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_magic_notes",
            reference_key="scene_text_system_role_magic_notes",
            prompt_text="scene_text_system_role_magic_notes",
            user_context=cls.user_model,
        )
        scene_text_user_prompt_magic_notes = PromptTemplateService.register_prompt_template(
            name="scene_text_user_prompt_magic_notes",
            reference_key="scene_text_user_prompt_magic_notes",
            prompt_text="scene_text_user_prompt_magic_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateMagicNotes.scene_text', {"system_role": str(scene_text_system_role_magic_notes.id), "user_prompt": str(scene_text_user_prompt_magic_notes.id)})


        beat_sheet_system_role_magic_notes = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_magic_notes",
            reference_key="beat_sheet_system_role_magic_notes",
            prompt_text="beat_sheet_system_role_magic_notes",
            user_context=cls.user_model,
        )
        beat_sheet_user_prompt_magic_notes = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_magic_notes",
            reference_key="beat_sheet_user_prompt_magic_notes",
            prompt_text="beat_sheet_user_prompt_magic_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateMagicNotes.beat_sheet', {"system_role": str(beat_sheet_system_role_magic_notes.id), "user_prompt": str(beat_sheet_user_prompt_magic_notes.id)})

        script_text_system_role_magic_notes = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_magic_notes",
            reference_key="script_text_system_role_magic_notes",
            prompt_text="script_text_system_role_magic_notes",
            user_context=cls.user_model,
        )
        script_text_user_prompt_magic_notes = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_magic_notes",
            reference_key="script_text_user_prompt_magic_notes",
            prompt_text="script_text_user_prompt_magic_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateMagicNotes.script_text', {"system_role": str(script_text_system_role_magic_notes.id), "user_prompt": str(script_text_user_prompt_magic_notes.id)})


        #expansive note templates
        story_text_system_role_expansive_notes = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_expansive_notes",
            reference_key="story_text_system_role_expansive_notes",
            prompt_text="story_text_system_role_expansive_notes",
            user_context=cls.user_model,
        )
        story_text_user_prompt_expansive_notes = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_expansive_notes",
            reference_key="story_text_user_prompt_expansive_notes",
            prompt_text="story_text_user_prompt_expansive_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.story_text', {"system_role": str(story_text_system_role_expansive_notes.id), "user_prompt": str(story_text_user_prompt_expansive_notes.id)})

        scene_text_system_role_expansive_notes = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_expansive_notes",
            reference_key="scene_text_system_role_expansive_notes",
            prompt_text="scene_text_system_role_expansive_notes",
            user_context=cls.user_model,
        )
        scene_text_user_prompt_expansive_notes = PromptTemplateService.register_prompt_template(
            name="scene_text_user_prompt_expansive_notes",
            reference_key="scene_text_user_prompt_expansive_notes",
            prompt_text="scene_text_user_prompt_expansive_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.scene_text', {"system_role": str(scene_text_system_role_expansive_notes.id), "user_prompt": str(scene_text_user_prompt_expansive_notes.id)})

        beat_sheet_system_role_expansive_notes = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_expansive_notes",
            reference_key="beat_sheet_system_role_expansive_notes",
            prompt_text="beat_sheet_system_role_expansive_notes",
            user_context=cls.user_model,
        )
        beat_sheet_user_prompt_expansive_notes = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_expansive_notes",
            reference_key="beat_sheet_user_prompt_expansive_notes",
            prompt_text="beat_sheet_user_prompt_expansive_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.beat_sheet', {"system_role": str(beat_sheet_system_role_expansive_notes.id), "user_prompt": str(beat_sheet_user_prompt_expansive_notes.id)})

        script_text_system_role_expansive_notes = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_expansive_notes",
            reference_key="script_text_system_role_expansive_notes",
            prompt_text="script_text_system_role_expansive_notes",
            user_context=cls.user_model,
        )
        script_text_user_prompt_expansive_notes = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_expansive_notes",
            reference_key="script_text_user_prompt_expansive_notes",
            prompt_text="script_text_user_prompt_expansive_notes",
            user_context=cls.user_model,
        )
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.script_text', {"system_role": str(script_text_system_role_expansive_notes.id), "user_prompt": str(script_text_user_prompt_expansive_notes.id)})


    @classmethod
    def create_project_for_test(cls, title="Test Project"):
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
        response = cls.client.post(
            '/graphql',
            headers=cls.auth_headers,
            json={'query': mutation}
        )
        #assert response.status_code == 200, "Response status code is not 200."
        json_data = response.get_json()

        project_id = json_data["data"]["createProject"]["project"]["id"]
        return project_id

    @classmethod
    def register_and_authenticate_user(cls):
        mutation = '''
          mutation {
            registerUser(email: "admin@example.com", password: "password123") {
              user {
                id
                email
              }
              accessToken
            }
          }
        '''
        response = cls.client.post('/graphql', json={'query': mutation})
        assert response.status_code == 200, "Registration mutation did not return a successful response."

        json_data = response.get_json()
        if json_data is not None:
            cls.user = json_data["data"]["registerUser"]["user"]
            cls.user_model = UserModel.objects.get(id=cls.user["id"])
            cls.user_model.admin_level = 1
            cls.user_model.save()
            cls.access_token = json_data["data"]["registerUser"]["accessToken"]
            cls.auth_headers = {
                'Authorization': f'Bearer {cls.access_token}'
            }

    def test_create_magic_note_critic(self):
        mutation = '''
          mutation {
            createMagicNoteCritic(name: "Test Critic", active: true, orderRank: 1) {
              magicNoteCritic {
                id
                name
              }
            }
          }
        '''
        response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': mutation}
        )

        self.assertEqual(response.status_code, 200, "CreateMagicNoteCritic mutation did not return a successful response.")

        json_data = response.get_json()
        magic_note_critic_data = json_data.get("data", {}).get("createMagicNoteCritic", {}).get("magicNoteCritic", {})
        self.assertIsNotNone(magic_note_critic_data.get("id"), "Magic Note Critic ID should not be None")
        self.assertEqual(magic_note_critic_data.get("name"), "Test Critic", "Name of the created critic should match the input.")

    def test_update_magic_note_critic(self):
        # First create a critic to update
        create_mutation = '''
            mutation {
                createMagicNoteCritic(name: "Original Critic", active: true, orderRank: 1) {
                    magicNoteCritic {
                        id
                    }
                }
            }
        '''
        create_response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': create_mutation}
        )
        critic_id = create_response.get_json()["data"]["createMagicNoteCritic"]["magicNoteCritic"]["id"]

        # Now, update the created critic
        update_mutation = f'''
            mutation {{
                updateMagicNoteCritic(
                    criticId: "{critic_id}",
                    name: "Updated Critic"
                ) {{
                    magicNoteCritic {{
                        id
                        name
                    }}
                }}
            }}
        '''
        update_response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': update_mutation}
        )

        self.assertEqual(update_response.status_code, 200, "UpdateMagicNoteCritic mutation did not return a successful response.")
        updated_data = update_response.get_json()["data"]["updateMagicNoteCritic"]["magicNoteCritic"]
        self.assertEqual(updated_data["name"], "Updated Critic", "Critic name should be updated.")

    def test_delete_magic_note_critic(self):
        # First create a critic to delete
        create_mutation = '''
            mutation {
                createMagicNoteCritic(name: "Critic to Delete", active: true, orderRank: 1) {
                    magicNoteCritic {
                        id
                    }
                }
            }
        '''
        create_response= self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': create_mutation}
        )
        critic_id = create_response.get_json()["data"]["createMagicNoteCritic"]["magicNoteCritic"]["id"]

        # Now, delete the created critic
        delete_mutation = f'''
            mutation {{
                deleteMagicNoteCritic(criticId: "{critic_id}") {{
                    success
                }}
            }}
        '''
        delete_response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': delete_mutation}
        )

        self.assertEqual(delete_response.status_code, 200, "DeleteMagicNoteCritic mutation did not return a successful response.")

        delete_data = delete_response.get_json()["data"]["deleteMagicNoteCritic"]
        self.assertTrue(delete_data["success"], "Success flag should be True after deletion.")


    def test_get_magic_note_critic_by_id(self):
        # First create a critic to retrieve
        create_mutation = '''
            mutation {
                createMagicNoteCritic(name: "Critic For Test", active: true, orderRank: 1) {
                    magicNoteCritic {
                        id
                        name
                        active
                    }
                }
            }
        '''
        create_response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': create_mutation}
        )
        created_data = create_response.get_json()['data']['createMagicNoteCritic']['magicNoteCritic']
        known_id = created_data['id']

        # Now retrieve the critic by the known ID
        query = f'''
            {{
                getMagicNoteCritic(criticId: "{known_id}") {{
                    id
                    name
                    active
                }}
            }}
        '''
        response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': query}
        )

        self.assertEqual(response.status_code, 200)
        magic_note_critic_data = response.get_json()['data']['getMagicNoteCritic']
        self.assertIsNotNone(magic_note_critic_data)
        self.assertEqual(magic_note_critic_data['id'], known_id)

    def test_list_magic_note_critics(self):

        # First create a critic to retrieve
        create_mutation = '''
            mutation {
                createMagicNoteCritic(name: "Critic For Test 2", active: true, orderRank: 1) {
                    magicNoteCritic {
                        id
                        name
                        active
                    }
                }
            }
        '''
        create_response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': create_mutation}
        )
        created_data = create_response.get_json()['data']['createMagicNoteCritic']['magicNoteCritic']
        known_id = created_data['id']


        # Query to list all MagicNoteCritics
        query = '''
            {
                listMagicNoteCritics {
                    magicNoteCritics {
                        id
                        userEmail
                        active
                        name
                        orderRank
                        storyTextPrompt
                        sceneTextPrompt
                        beatSheetPrompt
                        scriptTextPrompt
                        createdAt
                        updatedAt
                    }
                }
            }
        '''
        response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': query}
        )

        self.assertEqual(response.status_code, 200)
        magic_note_critics_data = response.get_json().get('data', {}).get('listMagicNoteCritics').get('magicNoteCritics')
        self.assertIsNotNone(magic_note_critics_data, "The response data should not be None")
        self.assertIsInstance(magic_note_critics_data, list, "The response should be a list")


    def test_list_magic_note_critics_by_type(self):
        query = '''
            {
                listMagicNoteCriticsByType(documentType: "ScriptText") {
                    id
                    name
                }
            }
        '''
        response = self.client.post(
            '/graphql',
            headers=self.auth_headers,
            json={'query': query}
        )

        self.assertEqual(response.status_code, 200)
        magic_note_critics_by_type_data = response.get_json()['data']['listMagicNoteCriticsByType']
        self.assertIsInstance(magic_note_critics_by_type_data, list)
        # Check if each returned critic has 'id' and 'name' keys
        for critic in magic_note_critics_by_type_data:
            self.assertIn('id', critic)
            self.assertIn('name', critic)

    def test_generate_magic_notes(self):
        # Assuming you have a method to fetch the latest StoryTextModel object's ID for the project
        story_text_id = self.get_story_text_id_for_project(self.project_id)

        mutation = f'''
          mutation GenerateMagicNotes {{
            generateMagicNotes(
              projectId: "{self.project_id}",
              documentType: "StoryText",
              documentId: "{story_text_id}"
            ) {{
              agentTaskId
            }}
          }}
        '''

        response = self.client.post(
            '/graphql',
            headers={'Authorization': f'Bearer {self.access_token}'},  # Assuming you have a method to obtain an access token
            json={'query': mutation}
        )
        self.assertEqual(response.status_code, 200, "GenerateMagicNotes mutation did not return a successful response.")

        json_data = response.get_json()
        data = json_data.get("data", {}).get("generateMagicNotes", {})

        self.assertIsNotNone(data.get("agentTaskId"), "Agent Task ID should not be None")

    def test_generate_expansive_notes(self):
        # Assuming you have a method to fetch the latest StoryTextModel object's ID for the project
        story_text_id = self.get_story_text_id_for_project(self.project_id)

        mutation = f'''
          mutation GenerateExpansiveNotes {{
            generateExpansiveNotes(
              projectId: "{self.project_id}",
              documentType: "StoryText",
              documentId: "{story_text_id}"
            ) {{
              agentTaskId
            }}
          }}
        '''

        response = self.client.post(
            '/graphql',
            headers={'Authorization': f'Bearer {self.access_token}'},  # Assuming you have a method to obtain an access token
            json={'query': mutation}
        )
        self.assertEqual(response.status_code, 200, "GenerateExpansiveNotes mutation did not return a successful response.")

        json_data = response.get_json()
        data = json_data.get("data", {}).get("generateExpansiveNotes", {})

        self.assertIsNotNone(data.get("agentTaskId"), "Agent Task ID should not be None")

    def get_story_text_id_for_project(self, project_id):
        story_text = StoryTextModel.objects(project_id=project_id).first()
        return story_text.id

    @classmethod
    def tearDownClass(cls):
        # Cleanup - delete test user and any associated critics from the database
        UserModel.objects.delete()
        MagicNoteCriticModel.objects.delete()
        ProjectModel.objects.delete()
        StoryTextModel.objects.delete()
