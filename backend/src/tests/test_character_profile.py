import unittest
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.CharacterProfile.CharacterProfileModel import CharacterProfileModel
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.CharacterProfile.CharacterProfileService import CharacterProfileService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from bson import ObjectId
from unittest.mock import patch, MagicMock
from main.modules.Admin.AdminService import AdminService

class TestCharacterProfile(BaseTestCase):

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

    def test_create_character_profile(self):
        name = "Bob"
        text_seed = "Just a regular guy"

        # Define the GraphQL mutation for creating a new character text
        mutation = f'''
          mutation {{
            createCharacterProfile(projectId: "{str(self.project_id)}", name: "{name}", textSeed: "{text_seed}") {{
              characterProfile {{
                id
                name
                textSeed
              }}
            }}
          }}
        '''

        response = self.query_user_1(mutation)
        self.assertFalse('errors' in response, f"GraphQL Error: {response.get('errors')}")

        # Get the data from the createCharacterProfile mutation response
        character_profile_data = response["data"]["createCharacterProfile"]["characterProfile"]

        # Verify that the character text was created with the correct name and seed
        self.assertEqual(character_profile_data['name'], name)
        self.assertEqual(character_profile_data['textSeed'], text_seed)

        # Verify that the character text was actually saved in the database
        created_character_profile = CharacterProfileModel.objects(id=ObjectId(character_profile_data['id'])).first()
        self.assertIsNotNone(created_character_profile)
        self.assertEqual(created_character_profile.name, name)
        self.assertEqual(created_character_profile.text_seed, text_seed)

    def test_get_character_profile(self):
        # Setup - create a new character text to retrieve later
        character_profile = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Character One",
            text_seed="The beginning of an epic character."
        )

        # Execute - Get the specific character text by id
        query = f'''
        query {{
            getCharacterProfile(projectId: "{str(self.project_id)}", textId: "{str(character_profile.id)}") {{
                id
                name
                textContent
                textSeed
            }}
        }}
        '''
        response = self.query_user_1(query)

        # Verify - Check the response and the retrieved data
        data = response['data']['getCharacterProfile']
        self.assertEqual(data['name'], "Character One")
        self.assertEqual(data['textContent'], character_profile.text_content)
        self.assertEqual(data['textSeed'], character_profile.text_seed)


    def test_list_project_characters(self):
        # Setup - create multiple character texts to list
        names = ["Character One", "Character Two", "Character Three"]
        for name in names:
            CharacterProfileService.create_character_profile(
                project_id=str(self.project_id),
                user=self.user_1,
                name=name,
                text_seed=f"The beginning of {name.lower()}."
            )

        # Execute - List all characters for a project
        query = f'''
        query {{
            listProjectCharacters(projectId: "{str(self.project_id)}") {{
                name
                characterOrder
            }}
        }}
        '''
        response = self.query_user_1(query)

        # Verify - Check the responseand ensure all characters are listed in the correct order
        characters = response['data']['listProjectCharacters']
        self.assertEqual(len(characters), len(names))
        for i, character in enumerate(characters):
            self.assertEqual(character['name'], names[i])
            self.assertEqual(character['characterOrder'], i + 1)  # Assuming character_order starts at 1

    def test_delete_character_by_key(self):
        # Setup - create a new character text to delete later
        character_profile = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Character to Delete",
            text_seed="This character will be deleted."
        )

        # Execute - Delete the specific character by key
        mutation = f'''
        mutation {{
            deleteCharacterByKey(projectId: "{str(self.project_id)}", characterKey: "{str(character_profile.character_key)}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Verify - Check the response and ensure the character was deleted
        data = response['data']['deleteCharacterByKey']
        self.assertTrue(data['success'])

        # Additional Verification - Confirm that the character no longer exists in the database
        deleted_character = CharacterProfileModel.objects(character_key=character_profile.character_key).first()
        self.assertIsNone(deleted_character)

    def test_reorder_character(self):
        # Setup - create multiple character texts to reorder
        character_profiles = [
            CharacterProfileService.create_character_profile(
                project_id=str(self.project_id),
                user=self.user_1,
                name=f"Character {i}",
                text_seed=f"Content for character {i}."
            ) for i in range(3)
        ]
        # The character we want to reorder
        character_to_move = character_profiles[0]
        # New order position
        new_order = 3

        # Execute - Reorder the first character to the last
        mutation = f'''
        mutation {{
            reorderCharacter(projectId: "{str(self.project_id)}", textId: "{str(character_to_move.id)}", newCharacterOrder: {new_order}) {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Verify - Check the response and the new order of the characters
        data = response['data']['reorderCharacter']
        self.assertTrue(data['success'])

        # Additional Verification - Confirm that the new order is reflected in the database
        reordered_character = CharacterProfileModel.objects(id=character_to_move.id).first()
        self.assertEqual(reordered_character.character_order, new_order)

    def test_list_character_versions(self):
        # Setup - create initial version and additional versions
        character_profile_id = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Initial Character",
            text_seed="Initial content"
        ).id
        for _ in range(2):  # Create 2 additional versions
            CharacterProfileService.create_new_version(
                source_text=CharacterProfileModel.objects.get(id=character_profile_id),
                user=self.user_1,
                version_type="edit",
                name="Updated Character",
                text_seed="Updated seed",
                text_content="Updated content"
            )

        # Perform the GraphQL query to list all character versions
        character_key = str(CharacterProfileModel.objects.get(id=character_profile_id).character_key)
        query = f'''
        query {{
            listCharacterVersions(projectId: "{str(self.project_id)}", characterKey: "{character_key}") {{
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
        data = response['data']['listCharacterVersions']
        self.assertEqual(len(data), 3)  # Initial + 2 new versions
        self.assertEqual(data[0]['versionNumber'], 1)  # Check the version number of the first version

    def test_update_character_version_label(self):
        # Setup - create a character text version
        character_profile = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Character for Label Update",
            text_seed="Character content"
        )

        # Perform the GraphQL mutation to update the version label
        new_version_label = "Reviewed Version"
        mutation = f'''
        mutation {{
            updateCharacterVersionLabel(projectId: "{str(self.project_id)}", characterProfileId: "{str(character_profile.id)}", versionLabel: "{new_version_label}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the version label was updated
        data = response['data']['updateCharacterVersionLabel']
        self.assertTrue(data['success'])

        # Additional assertion to verify the version label was updated in the database
        updated_character_profile = CharacterProfileModel.objects.get(id=character_profile.id)
        self.assertEqual(updated_character_profile.version_label, new_version_label)

    def test_rebase_character_profile_version(self):
        # Setup - create a character text and multiple versions to rebase
        character_profile = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Character to Rebase",
            text_seed="Initial seed"
        )
        for _ in range(2):  # Create 2 additional versions
            CharacterProfileService.create_new_version(
                source_text=CharacterProfileModel.objects.get(id=character_profile.id),
                user=self.user_1,
                version_type="edit",
                name="Updated Character",
                text_seed="Updated seed",
                text_content="Updated content"
            )

        # Get the ID of the version to rebase to (latest version for this test)
        versions = CharacterProfileModel.objects(character_key=character_profile.character_key).order_by('-version_number')
        version_to_rebase_to = versions.first()

        # Perform the GraphQL mutation to rebase the character text to a specified version
        mutation = f'''
        mutation {{
            rebaseCharacterProfile(projectId: "{str(self.project_id)}", characterProfileId: "{str(version_to_rebase_to.id)}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the rebase was done
        data = response['data']['rebaseCharacterProfile']
        self.assertTrue(data['success'])

        # Additional assertion to verify only one version remains after the rebase
        remaining_versions = CharacterProfileModel.objects(character_key=character_profile.character_key)
        self.assertEqual(remaining_versions.count(), 1, "More than one version remains after rebase.")
        rebased_version = remaining_versions.first()
        self.assertEqual(rebased_version.version_type, 'base', "Rebased version is not set as 'base'.")
        self.assertEqual(rebased_version.version_number, 1, "Rebased version number is not set as 1.")

    def test_update_character_profile(self):
        # Setup - create a character text to update
        character_profile = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Character to Update",
            text_seed="Initial seed"
        )

        # Define the updates to apply to the character text
        update_fields = {
            "name": "Updated Character Title",
            "text_seed": "Updated seed text",
            "text_notes": "Some insightful notes",
            "text_content": "The actual content of the character text",
        }

        # Perform the GraphQL mutation to update the character text
        mutation = f'''
        mutation {{
            updateCharacterProfile(projectId: "{str(self.project_id)}", textId: "{str(character_profile.id)}", name: "{update_fields['name']}", textSeed: "{update_fields['text_seed']}", textNotes: "{update_fields['text_notes']}", textContent: "{update_fields['text_content']}") {{
                characterProfile {{
                    id
                    name
                    textSeed
                    textNotes
                    textContent
                }}
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the character text was updated
        character_profile_data = response['data']['updateCharacterProfile']['characterProfile']
        self.assertEqual(character_profile_data['name'], update_fields['name'])
        self.assertEqual(character_profile_data['textSeed'], update_fields['text_seed'])
        self.assertEqual(character_profile_data['textNotes'], update_fields['text_notes'])
        self.assertEqual(character_profile_data['textContent'], update_fields['text_content'])

        # Additional assertion to verify a new character text version was created
        versions_after_update = CharacterProfileModel.objects(character_key=character_profile.character_key).order_by('-version_number')
        self.assertGreater(len(versions_after_update), 1, "No new version was created.")
        latest_version = versions_after_update.first()
        self.assertEqual(latest_version.name, update_fields['name'], "Title was not updated.")
        self.assertEqual(latest_version.text_seed, update_fields['text_seed'], "Text seed was not updated.")
        self.assertEqual(latest_version.text_notes, update_fields['text_notes'], "Text notes were not updated.")
        self.assertEqual(latest_version.text_content, update_fields['text_content'], "Text content was not updated.")
        self.assertEqual(latest_version.created_by.id, self.user_1.id, "Created by user is incorrect.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_character_from_seed(self, mock_pika):
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
        character_profile_system_role = PromptTemplateService.register_prompt_template(
            name="character_profile_system_role_from_seed",
            reference_key="character_profile_system_role_from_seed",
            prompt_text="character_profile_system_role_prompt_template",
            user_context=self.user_1,
        )
        character_profile_prompt_text = PromptTemplateService.register_prompt_template(
            name="character_profile_prompt_text_from_seed",
            reference_key="character_profile_prompt_text_from_seed",
            prompt_text="character_profile_prompt_text_prompt_template",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateCharacterFromSeed', {"system_role": str(character_profile_system_role.id), "user_prompt": str(character_profile_prompt_text.id)})


        # Setup - create a character text to generate from seed
        character_profile = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Initial Character",
            text_seed="Seed for generation"
        )

        # Perform the GraphQL mutation to generate character from seed
        mutation = f'''
        mutation {{
            generateCharacterFromSeed(projectId: "{str(self.project_id)}", textId: "{str(character_profile.id)}", textSeed: "{character_profile.text_seed}") {{
                agentTaskId
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and an agentTaskId is returned
        data = response['data']['generateCharacterFromSeed']
        self.assertIsNotNone(data['agentTaskId'], "agentTaskId is None.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_character_with_notes(self, mock_pika):
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
        character_profile_system_role = PromptTemplateService.register_prompt_template(
            name="character_profile_system_role_with_notes",
            reference_key="character_profile_system_role_with_notes",
            prompt_text="character_profile_system_role_prompt_template",
            user_context=self.user_1,
        )
        character_profile_prompt_text = PromptTemplateService.register_prompt_template(
            name="character_profile_prompt_text_with_notes",
            reference_key="character_profile_prompt_text_with_notes",
            prompt_text="character_profile_prompt_text_prompt_template",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateCharacterWithNotes', {"system_role": str(character_profile_system_role.id), "user_prompt": str(character_profile_prompt_text.id)})

        character_profile_system_role_with_notes_selective = PromptTemplateService.register_prompt_template(
            name="character_profile_system_role_with_notes_selective",
            reference_key="character_profile_system_role_with_notes_selective",
            prompt_text="character_profile_system_role_with_notes_selective",
            user_context=self.user_1,
        )
        character_profile_prompt_text_with_notes_selective = PromptTemplateService.register_prompt_template(
            name="character_profile_prompt_text_with_notes_selective",
            reference_key="character_profile_prompt_text_with_notes_selective",
            prompt_text="character_profile_prompt_text_with_notes_selective",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateCharacterWithNotes.selective', {"system_role": str(character_profile_system_role_with_notes_selective.id), "user_prompt": str(character_profile_prompt_text_with_notes_selective.id)})


        # Setup - create a character text to generate from notes
        character_profile = CharacterProfileService.create_character_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Initial Character",
            text_seed="Seed for generation"
        )

        # Perform the GraphQL mutation to generate character from notes
        mutation = f'''
        mutation {{
            generateCharacterWithNotes(projectId: "{str(self.project_id)}", textId: "{str(character_profile.id)}", textNotes: "{character_profile.text_notes}") {{
                agentTaskId
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and an agentTaskId is returned
        data = response['data']['generateCharacterWithNotes']
        self.assertIsNotNone(data['agentTaskId'], "agentTaskId is None.")

    def tearDown(self):
        super().tearDown()
        # Cleanup - delete the characters created for this test
        CharacterProfileModel.objects.delete()
        PromptTemplateModel.objects.delete()
        ProjectModel.objects.delete()
