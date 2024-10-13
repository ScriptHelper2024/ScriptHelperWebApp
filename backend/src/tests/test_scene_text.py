import unittest
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.SceneText.SceneTextService import SceneTextService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from bson import ObjectId
from unittest.mock import patch, MagicMock
from main.modules.Admin.AdminService import AdminService


class TestSceneText(BaseTestCase):

    def setUp(self):
        super().setUp()
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

    def test_create_scene_text(self):
        title = "Opening Scene"
        text_seed = "It was a dark and stormy night..."

        # Define the GraphQL mutation for creating a new scene text
        mutation = f'''
          mutation {{
            createSceneText(projectId: "{str(self.project_id)}", title: "{title}", textSeed: "{text_seed}") {{
              sceneText {{
                id
                title
                textSeed
              }}
            }}
          }}
        '''

        response = self.query_user_1(mutation)
        self.assertFalse('errors' in response, f"GraphQL Error: {response.get('errors')}")

        # Get the data from the createSceneText mutation response
        scene_text_data = response["data"]["createSceneText"]["sceneText"]

        # Verify that the scene text was created with the correct title and seed
        self.assertEqual(scene_text_data['title'], title)
        self.assertEqual(scene_text_data['textSeed'], text_seed)

        # Verify that the scene text was actually saved in the database
        created_scene_text = SceneTextModel.objects(id=ObjectId(scene_text_data['id'])).first()
        self.assertIsNotNone(created_scene_text)
        self.assertEqual(created_scene_text.title, title)
        self.assertEqual(created_scene_text.text_seed, text_seed)

    def test_get_scene_text(self):
        # Setup - create a new scene text to retrieve later
        scene_text = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Scene One",
            text_seed="The beginning of an epic scene."
        )

        # Execute - Get the specific scene text by id
        query = f'''
        query {{
            getSceneText(projectId: "{str(self.project_id)}", textId: "{str(scene_text.id)}") {{
                id
                title
                textContent
                textSeed
            }}
        }}
        '''
        response = self.query_user_1(query)

        # Verify - Check the response and the retrieved data
        data = response['data']['getSceneText']
        self.assertEqual(data['title'], "Scene One")
        self.assertEqual(data['textContent'], scene_text.text_content)
        self.assertEqual(data['textSeed'], scene_text.text_seed)


    def test_list_project_scenes(self):
        # Setup - create multiple scene texts to list
        titles = ["Scene One", "Scene Two", "Scene Three"]
        for title in titles:
            SceneTextService.create_scene_text(
                project_id=str(self.project_id),
                user=self.user_1,
                title=title,
                text_seed=f"The beginning of {title.lower()}."
            )

        # Execute - List all scenes for a project
        query = f'''
        query {{
            listProjectScenes(projectId: "{str(self.project_id)}") {{
                title
                sceneOrder
            }}
        }}
        '''
        response = self.query_user_1(query)

        # Verify - Check the responseand ensure all scenes are listed in the correct order
        scenes = response['data']['listProjectScenes']
        self.assertEqual(len(scenes), len(titles))
        for i, scene in enumerate(scenes):
            self.assertEqual(scene['title'], titles[i])
            self.assertEqual(scene['sceneOrder'], i + 1)  # Assuming scene_order starts at 1

    def test_delete_scene_by_key(self):
        # Setup - create a new scene text to delete later
        scene_text = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Scene to Delete",
            text_seed="This scene will be deleted."
        )

        # Execute - Delete the specific scene by key
        mutation = f'''
        mutation {{
            deleteSceneByKey(projectId: "{str(self.project_id)}", sceneKey: "{str(scene_text.scene_key)}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Verify - Check the response and ensure the scene was deleted
        data = response['data']['deleteSceneByKey']
        self.assertTrue(data['success'])

        # Additional Verification - Confirm that the scene no longer exists in the database
        deleted_scene = SceneTextModel.objects(scene_key=scene_text.scene_key).first()
        self.assertIsNone(deleted_scene)

    def test_reorder_scene(self):
        # Setup - create multiple scene texts to reorder
        scene_texts = [
            SceneTextService.create_scene_text(
                project_id=str(self.project_id),
                user=self.user_1,
                title=f"Scene {i}",
                text_seed=f"Content for scene {i}."
            ) for i in range(3)
        ]
        # The scene we want to reorder
        scene_to_move = scene_texts[0]
        # New order position
        new_order = 3

        # Execute - Reorder the first scene to the last
        mutation = f'''
        mutation {{
            reorderScene(projectId: "{str(self.project_id)}", textId: "{str(scene_to_move.id)}", newSceneOrder: {new_order}) {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Verify - Check the response and the new order of the scenes
        data = response['data']['reorderScene']
        self.assertTrue(data['success'])

        # Additional Verification - Confirm that the new order is reflected in the database
        reordered_scene = SceneTextModel.objects(id=scene_to_move.id).first()
        self.assertEqual(reordered_scene.scene_order, new_order)

    def test_list_scene_versions(self):
        # Setup - create initial version and additional versions
        scene_text_id = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Initial Scene",
            text_seed="Initial content"
        ).id
        for _ in range(2):  # Create 2 additional versions
            SceneTextService.create_new_version(
                source_text=SceneTextModel.objects.get(id=scene_text_id),
                user=self.user_1,
                version_type="edit",
                title="Updated Scene",
                text_seed="Updated seed",
                text_content="Updated content"
            )

        # Perform the GraphQL query to list all scene versions
        scene_key = str(SceneTextModel.objects.get(id=scene_text_id).scene_key)
        query = f'''
        query {{
            listSceneVersions(projectId: "{str(self.project_id)}", sceneKey: "{scene_key}") {{
                id
                versionType
                versionNumber
                versionLabel
                llmModel
                createdAt
                createdBy
            }}
        }}
        '''
        response = self.query_user_1(query)

        # Assert that the response is successful and the data is correct
        data = response['data']['listSceneVersions']
        self.assertEqual(len(data), 3)  # Initial + 2 new versions
        self.assertEqual(data[0]['versionNumber'], 1)  # Check the version number of the first version

    def test_update_scene_version_label(self):
        # Setup - create a scene text version
        scene_text = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Scene for Label Update",
            text_seed="Scene content"
        )

        # Perform the GraphQL mutation to update the version label
        new_version_label = "Reviewed Version"
        mutation = f'''
        mutation {{
            updateSceneVersionLabel(projectId: "{str(self.project_id)}", sceneTextId: "{str(scene_text.id)}", versionLabel: "{new_version_label}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the version label was updated
        data = response['data']['updateSceneVersionLabel']
        self.assertTrue(data['success'])

        # Additional assertion to verify the version label was updated in the database
        updated_scene_text = SceneTextModel.objects.get(id=scene_text.id)
        self.assertEqual(updated_scene_text.version_label, new_version_label)

    def test_rebase_scene_text_version(self):
        # Setup - create a scene text and multiple versions to rebase
        scene_text = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Scene to Rebase",
            text_seed="Initial seed"
        )
        for _ in range(2):  # Create 2 additional versions
            SceneTextService.create_new_version(
                source_text=SceneTextModel.objects.get(id=scene_text.id),
                user=self.user_1,
                version_type="edit",
                title="Updated Scene",
                text_seed="Updated seed",
                text_content="Updated content"
            )

        # Get the ID of the version to rebase to (latest version for this test)
        versions = SceneTextModel.objects(scene_key=scene_text.scene_key).order_by('-version_number')
        version_to_rebase_to = versions.first()

        # Perform the GraphQL mutation to rebase the scene text to a specified version
        mutation = f'''
        mutation {{
            rebaseSceneText(projectId: "{str(self.project_id)}", sceneTextId: "{str(version_to_rebase_to.id)}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the rebase was done
        data = response['data']['rebaseSceneText']
        self.assertTrue(data['success'])

        # Additional assertion to verify only one version remains after the rebase
        remaining_versions = SceneTextModel.objects(scene_key=scene_text.scene_key)
        self.assertEqual(remaining_versions.count(), 1, "More than one version remains after rebase.")
        rebased_version = remaining_versions.first()
        self.assertEqual(rebased_version.version_type, 'base', "Rebased version is not set as 'base'.")
        self.assertEqual(rebased_version.version_number, 1, "Rebased version number is not set as 1.")

    def test_update_scene_text(self):
        # Setup - create a scene text to update
        scene_text = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Scene to Update",
            text_seed="Initial seed"
        )

        # Define the updates to apply to the scene text
        update_fields = {
            "title": "Updated Scene Title",
            "text_seed": "Updated seed text",
            "text_notes": "Some insightful notes",
            "text_content": "The actual content of the scene text",
        }

        # Perform the GraphQL mutation to update the scene text
        mutation = f'''
        mutation {{
            updateSceneText(projectId: "{str(self.project_id)}", textId: "{str(scene_text.id)}", title: "{update_fields['title']}", textSeed: "{update_fields['text_seed']}", textNotes: "{update_fields['text_notes']}", textContent: "{update_fields['text_content']}") {{
                sceneText {{
                    id
                    title
                    textSeed
                    textNotes
                    textContent
                }}
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the scene text was updated
        scene_text_data = response['data']['updateSceneText']['sceneText']
        self.assertEqual(scene_text_data['title'], update_fields['title'])
        self.assertEqual(scene_text_data['textSeed'], update_fields['text_seed'])
        self.assertEqual(scene_text_data['textNotes'], update_fields['text_notes'])
        self.assertEqual(scene_text_data['textContent'], update_fields['text_content'])

        # Additional assertion to verify a new scene text version was created
        versions_after_update = SceneTextModel.objects(scene_key=scene_text.scene_key).order_by('-version_number')
        self.assertGreater(len(versions_after_update), 1, "No new version was created.")
        latest_version = versions_after_update.first()
        self.assertEqual(latest_version.title, update_fields['title'], "Title was not updated.")
        self.assertEqual(latest_version.text_seed, update_fields['text_seed'], "Text seed was not updated.")
        self.assertEqual(latest_version.text_notes, update_fields['text_notes'], "Text notes were not updated.")
        self.assertEqual(latest_version.text_content, update_fields['text_content'], "Text content was not updated.")
        self.assertEqual(latest_version.created_by.id, self.user_1.id, "Created by user is incorrect.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_scene_from_seed(self, mock_pika):
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
        project_profile_prompt = PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text="project_profile_prompt",
            user_context=self.user_1,
        )
        scene_text_system_role = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_from_seed",
            reference_key="scene_text_system_role_from_seed",
            prompt_text="scene_text_system_role_prompt_template",
            user_context=self.user_1,
        )
        scene_text_prompt_text = PromptTemplateService.register_prompt_template(
            name="scene_text_prompt_text_from_seed",
            reference_key="scene_text_prompt_text_from_seed",
            prompt_text="scene_text_prompt_text_prompt_template",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateSceneFromSeed', {"system_role": str(scene_text_system_role.id), "user_prompt": str(scene_text_prompt_text.id)})

        # Setup - create a scene text to generate from seed
        scene_text = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Initial Scene",
            text_seed="Seed for generation"
        )

        # Perform the GraphQL mutation to generate scene from seed
        mutation = f'''
        mutation {{
            generateSceneFromSeed(projectId: "{str(self.project_id)}", textId: "{str(scene_text.id)}", textSeed: "{scene_text.text_seed}") {{
                agentTaskId
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and an agentTaskId is returned
        data = response['data']['generateSceneFromSeed']
        self.assertIsNotNone(data['agentTaskId'], "agentTaskId is None.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_scene_with_notes(self, mock_pika):
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
        project_profile_prompt = PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text="project_profile_prompt",
            user_context=self.user_1,
        )
        scene_text_system_role = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_with_notes",
            reference_key="scene_text_system_role_with_notes",
            prompt_text="scene_text_system_role_prompt_template",
            user_context=self.user_1,
        )
        scene_text_prompt_text = PromptTemplateService.register_prompt_template(
            name="scene_text_prompt_text_with_notes",
            reference_key="scene_text_prompt_text_with_notes",
            prompt_text="scene_text_prompt_text_prompt_template",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateSceneWithNotes', {"system_role": str(scene_text_system_role.id), "user_prompt": str(scene_text_prompt_text.id)})

        # Setup - create a scene text to generate from notes
        scene_text = SceneTextService.create_scene_text(
            project_id=str(self.project_id),
            user=self.user_1,
            title="Initial Scene",
            text_seed="Seed for generation"
        )

        # Perform the GraphQL mutation to generate scene from notes
        mutation = f'''
        mutation {{
            generateSceneWithNotes(projectId: "{str(self.project_id)}", textId: "{str(scene_text.id)}", textNotes: "{scene_text.text_notes}") {{
                agentTaskId
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and an agentTaskId is returned
        data = response['data']['generateSceneWithNotes']
        self.assertIsNotNone(data['agentTaskId'], "agentTaskId is None.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_make_scenes(self, mock_pika):
        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel


        project_profile_prompt = PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text="project_profile_prompt",
            user_context=self.user_1,
        )
        system_role = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_make_scenes",
            reference_key="scene_text_system_role_make_scenes",
            prompt_text="scene_text_system_role_make_scenes",
            user_context=self.user_1,
        )
        prompt_text = PromptTemplateService.register_prompt_template(
            name="scene_text_user_prompt_make_scenes",
            reference_key="scene_text_user_prompt_make_scenes",
            prompt_text="scene_text_user_prompt_make_scenes",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateMakeScenes', {"system_role": str(system_role.id), "user_prompt": str(prompt_text.id)})

        project = ProjectModel.objects(id=self.project_id).first()
        story_text_id = project.getLatestStoryTextId()

        # Perform the GraphQL mutation to generate scene from notes
        mutation = f'''
        mutation {{
            generateMakeScenes(projectId: "{str(self.project_id)}", storyTextId: "{story_text_id}", sceneCount: 24) {{
                agentTaskId
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and an agentTaskId is returned
        data = response['data']['generateMakeScenes']
        self.assertIsNotNone(data['agentTaskId'], "agentTaskId is None.")


    def test_sequential_scene_order_after_reordering(self):
        # Setup - Create multiple scene texts within a project
        project_id = str(self.project_id)
        user = self.user_1

        scene_texts = [
            SceneTextService.create_scene_text(
                project_id=project_id,
                user=user,
                title=f"Scene {i}",
                text_seed=f"Content for scene {i}."
            ) for i in range(1, 7)  # Creating 6 scenes
        ]

        # The scene we want to reorder - move the first scene to position 3
        scene_to_move = scene_texts[0]
        new_order = 3

        # Execute - Reorder the scene using the GraphQL mutation
        mutation = f'''
        mutation {{
            reorderScene(projectId: "{project_id}", textId: "{str(scene_to_move.id)}", newSceneOrder: {new_order}) {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)
        assert 'errors' not in response, f"GraphQL returned errors: {response['errors']}"

        # Verify - Check the mutation response for success
        assert response['data']['reorderScene']['success'] is True, "Reordering scene failed according to GraphQL response."

        # Additional Verification - Confirm that scene orders are sequential and ch
        reordered_scenes = SceneTextModel.objects(project_id=project_id).order_by('scene_order')
        for index, scene in enumerate(reordered_scenes):
            expected_order = index + 1
            assert scene.scene_order == expected_order, f"Scene order is incorrect. Expected {expected_order}, got {scene.scene_order}"

    def tearDown(self):
        super().tearDown()
        # Cleanup - delete the scenes created for this test
        SceneTextModel.objects.delete()
        PromptTemplateModel.objects.delete()
        ProjectModel.objects.delete()
