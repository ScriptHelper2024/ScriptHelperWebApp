import unittest
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.SceneText.SceneTextService import SceneTextService
from main.modules.BeatSheet.BeatSheetService import BeatSheetService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from unittest.mock import patch, MagicMock
from main.modules.Admin.AdminService import AdminService
from bson import ObjectId

class TestBeatSheet(BaseTestCase):

    def setUp(self):
        super().setUp()

        # Create a project to use for the tests
        self.project_id = self.create_project_for_test()
        self.scene_id, self.scene_key = self.create_scene_for_test()
        self.beat_sheet_id = self.get_latest_beat_sheet_id_for_scene(self.scene_id)

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
        beat_sheet_system_role_from_scene = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_from_scene",
            reference_key="beat_sheet_system_role_from_scene",
            prompt_text="beat_sheet_system_role_from_scene",
            user_context=self.user_1,
        )
        beat_sheet_user_prompt_from_scene = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_from_scene",
            reference_key="beat_sheet_user_prompt_from_scene",
            prompt_text="beat_sheet_user_prompt_from_scene",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateBeatSheetFromScene', {"system_role": str(beat_sheet_system_role_from_scene.id), "user_prompt": str(beat_sheet_user_prompt_from_scene.id)})


        beat_sheet_system_role_with_notes = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_with_notes",
            reference_key="beat_sheet_system_role_with_notes",
            prompt_text="beat_sheet_system_role_with_notes",
            user_context=self.user_1,
        )
        beat_sheet_user_prompt_with_notes = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_with_notes",
            reference_key="beat_sheet_user_prompt_with_notes",
            prompt_text="beat_sheet_user_prompt_with_notes",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateBeatSheetWithNotes', {"system_role": str(beat_sheet_system_role_with_notes.id), "user_prompt": str(beat_sheet_system_role_with_notes.id)})



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
        #assert response.status_code == 200, "Response status code is not 200."
        #json_data = response.get_json()
        assert 'errors' not in response, f"GraphQL Error: {response.get('errors')}"

        project_id = response["data"]["createProject"]["project"]["id"]
        return project_id

    def create_scene_for_test(self):
        # Execute a GraphQL mutation to create a scene text
        scene_order_after = 0
        text_seed = "A beggining of a new adventure"
        title = "Scene One"
        mutation = f'''
          mutation {{
            createSceneText(
              projectId: "{self.project_id}",
              sceneOrderAfter: {scene_order_after},
              textSeed: "{text_seed}",
              title: "{title}"
            ) {{
              sceneText {{
                id
                sceneKey
                title
                sceneOrder
                textSeed
                textContent
              }}
            }}
          }}
        '''
        response = self.query_user_1(mutation)

        ## Assert successful creation and return the scene ID
        #assert response.status_code == 200, "Response status code is not 200."
        #json_data = response.get_json()
        assert 'errors' not in response, f"GraphQL Error: {response.get('errors')}"
        scene_id = response["data"]["createSceneText"]["sceneText"]["id"]
        scene_key = response["data"]["createSceneText"]["sceneText"]["sceneKey"]

        return scene_id, scene_key

    def get_latest_beat_sheet_id_for_scene(self, scene_id):
        scene_text = SceneTextModel.objects(id=scene_id).first()
        if not scene_text:
            raise Exception("Scene text not found for the given ID")
        beat_sheet_id = scene_text.getLatestBeatSheetId()
        if not beat_sheet_id:
            # If no beat sheet exists, create one here, or raise an exception
            raise Exception("No beat sheet found or created for the scene text")
        return beat_sheet_id

    def test_get_beat_sheet(self):
        # Use beat_sheet_id from the class setup
        query = f'''
          query {{
              getBeatSheet(
                projectId: "{self.project_id}",
                textId: "{self.beat_sheet_id}",
                sceneKey: "{self.scene_key}"
              ){{
                id
                textContent
                versionNumber
              }}
          }}
        '''

        response = self.query_user_1(query)
        self.assertIsNotNone(response["data"]["getBeatSheet"])
        self.assertEqual(response["data"]["getBeatSheet"]["id"], self.beat_sheet_id)
        self.assertTrue('textContent' in response["data"]["getBeatSheet"])

    def test_get_beat_sheet_versions(self):
        # Assume we already have a scene_key from a created scene
        query = f'''
        query {{
            listBeatSheetVersions(projectId: "{self.project_id}",sceneKey: "{self.scene_key}") {{
                id
                versionNumber
            }}
        }}
        '''

        response = self.query_user_1(query)
        versions = response['data']['listBeatSheetVersions']
        self.assertIsInstance(versions, list)
        self.assertGreater(len(versions), 0)  # Check that at least one version is returned

    def test_rebase_beat_sheet(self):
        new_version_number = 1

        mutation = f'''
        mutation {{
            rebaseBeatSheet(
                sceneKey: "{self.scene_key}",
                projectId: "{self.project_id}",
                versionNumber: {new_version_number}
            ) {{
                success
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['rebaseBeatSheet']
        self.assertTrue(data['success'])

    def test_update_beat_sheet_version_label(self):
        # We'll use the existing beat_sheet_id and assume it has the correct version to update the label
        version_number_to_update = 1  # This version number should be existing in your test data
        new_version_label = "Updated Version"

        mutation = f'''
        mutation {{
            updateBeatSheetVersionLabel(
                sceneKey: "{self.scene_key}",
                projectId: "{self.project_id}",
                versionNumber: {version_number_to_update},
                versionLabel: "{new_version_label}"
            ) {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        data = response['data']['updateBeatSheetVersionLabel']
        self.assertTrue(data['success'])

    def test_update_beat_sheet(self):
        # Use scene_key, project_id, and text_id from the class setup
        new_text_content = "This is the updated content for the new version of the beat sheet."
        new_text_notes = "These are the new notes for the beat sheet."

        mutation = f'''
        mutation {{
            updateBeatSheet(
                sceneTextId: "{self.scene_id}",
                textId: "{self.beat_sheet_id}",
                projectId: "{self.project_id}",
                textNotes: "{new_text_notes}",
                textContent: "{new_text_content}"
            ) {{
                beatSheet {{
                    id
                    textContent
                    textNotes
                }}
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['updateBeatSheet']
        self.assertIsNotNone(data)
        self.assertIsNotNone(data['beatSheet'])
        self.assertEqual(data['beatSheet']['textContent'], new_text_content)
        self.assertEqual(data['beatSheet']['textNotes'], new_text_notes)

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_beat_sheet_from_scene(self, mock_pika):

        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Use the IDs from the class setup (scene_key, text_id, scene_text_id, project_id)
        mutation = f'''
        mutation {{
            generateBeatSheetFromScene(
                sceneKey: "{self.scene_key}",
                textId: "{self.beat_sheet_id}",
                sceneTextId: "{self.scene_id}",
                projectId: "{self.project_id}"
            ) {{
                agentTaskId
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['generateBeatSheetFromScene']
        self.assertIsNotNone(data['agentTaskId'])

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_beat_sheet_with_notes(self, mock_pika):

        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Use the IDs from the class setup (scene_key, text_id, project_id) and add text notes
        text_notes = "These are the test notes for the beat sheet."
        mutation = f'''
        mutation {{
            generateBeatSheetWithNotes(
                sceneKey: "{self.scene_key}",
                textId: "{self.beat_sheet_id}",
                textNotes: "{text_notes}",
                projectId: "{self.project_id}"

            ) {{
                agentTaskId
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['generateBeatSheetWithNotes']
        self.assertIsNotNone(data['agentTaskId'])

    def tearDown(self):
        # Cleanup - delete the test story texts, projects and user from the database
        super().tearDown()
        ScriptTextModel.objects.delete()
        BeatSheetModel.objects.delete()
        SceneTextModel.objects.delete()
        StoryTextModel.objects.delete()
        ProjectModel.objects.delete()
        PromptTemplateModel.objects.delete()
