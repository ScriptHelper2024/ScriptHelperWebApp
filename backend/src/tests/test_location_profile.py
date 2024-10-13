import unittest
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.LocationProfile.LocationProfileModel import LocationProfileModel
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.LocationProfile.LocationProfileService import LocationProfileService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from bson import ObjectId
from unittest.mock import patch, MagicMock
from main.modules.Admin.AdminService import AdminService


class TestLocationProfile(BaseTestCase):

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

    def test_create_location_profile(self):
        name = "Bob"
        text_seed = "Just a regular guy"

        # Define the GraphQL mutation for creating a new location text
        mutation = f'''
          mutation {{
            createLocationProfile(projectId: "{str(self.project_id)}", name: "{name}", textSeed: "{text_seed}") {{
              locationProfile {{
                id
                name
                textSeed
              }}
            }}
          }}
        '''

        response = self.query_user_1(mutation)
        self.assertFalse('errors' in response, f"GraphQL Error: {response.get('errors')}")

        # Get the data from the createLocationProfile mutation response
        location_profile_data = response["data"]["createLocationProfile"]["locationProfile"]

        # Verify that the location text was created with the correct name and seed
        self.assertEqual(location_profile_data['name'], name)
        self.assertEqual(location_profile_data['textSeed'], text_seed)

        # Verify that the location text was actually saved in the database
        created_location_profile = LocationProfileModel.objects(id=ObjectId(location_profile_data['id'])).first()
        self.assertIsNotNone(created_location_profile)
        self.assertEqual(created_location_profile.name, name)
        self.assertEqual(created_location_profile.text_seed, text_seed)

    def test_get_location_profile(self):
        # Setup - create a new location text to retrieve later
        location_profile = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Location One",
            text_seed="The beginning of an epic location."
        )

        # Execute - Get the specific location text by id
        query = f'''
        query {{
            getLocationProfile(projectId: "{str(self.project_id)}", textId: "{str(location_profile.id)}") {{
                id
                name
                textContent
                textSeed
            }}
        }}
        '''
        response = self.query_user_1(query)

        # Verify - Check the response and the retrieved data
        data = response['data']['getLocationProfile']
        self.assertEqual(data['name'], "Location One")
        self.assertEqual(data['textContent'], location_profile.text_content)
        self.assertEqual(data['textSeed'], location_profile.text_seed)


    def test_list_project_locations(self):
        # Setup - create multiple location texts to list
        names = ["Location One", "Location Two", "Location Three"]
        for name in names:
            LocationProfileService.create_location_profile(
                project_id=str(self.project_id),
                user=self.user_1,
                name=name,
                text_seed=f"The beginning of {name.lower()}."
            )

        # Execute - List all locations for a project
        query = f'''
        query {{
            listProjectLocations(projectId: "{str(self.project_id)}") {{
                name
                locationOrder
            }}
        }}
        '''
        response = self.query_user_1(query)

        # Verify - Check the responseand ensure all locations are listed in the correct order
        locations = response['data']['listProjectLocations']
        self.assertEqual(len(locations), len(names))
        for i, location in enumerate(locations):
            self.assertEqual(location['name'], names[i])
            self.assertEqual(location['locationOrder'], i + 1)  # Assuming location_order starts at 1

    def test_delete_location_by_key(self):
        # Setup - create a new location text to delete later
        location_profile = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Location to Delete",
            text_seed="This location will be deleted."
        )

        # Execute - Delete the specific location by key
        mutation = f'''
        mutation {{
            deleteLocationByKey(projectId: "{str(self.project_id)}", locationKey: "{str(location_profile.location_key)}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Verify - Check the response and ensure the location was deleted
        data = response['data']['deleteLocationByKey']
        self.assertTrue(data['success'])

        # Additional Verification - Confirm that the location no longer exists in the database
        deleted_location = LocationProfileModel.objects(location_key=location_profile.location_key).first()
        self.assertIsNone(deleted_location)

    def test_reorder_location(self):
        # Setup - create multiple location texts to reorder
        location_profiles = [
            LocationProfileService.create_location_profile(
                project_id=str(self.project_id),
                user=self.user_1,
                name=f"Location {i}",
                text_seed=f"Content for location {i}."
            ) for i in range(3)
        ]
        # The location we want to reorder
        location_to_move = location_profiles[0]
        # New order position
        new_order = 3

        # Execute - Reorder the first location to the last
        mutation = f'''
        mutation {{
            reorderLocation(projectId: "{str(self.project_id)}", textId: "{str(location_to_move.id)}", newLocationOrder: {new_order}) {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Verify - Check the response and the new order of the locations
        data = response['data']['reorderLocation']
        self.assertTrue(data['success'])

        # Additional Verification - Confirm that the new order is reflected in the database
        reordered_location = LocationProfileModel.objects(id=location_to_move.id).first()
        self.assertEqual(reordered_location.location_order, new_order)

    def test_list_location_versions(self):
        # Setup - create initial version and additional versions
        location_profile_id = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Initial Location",
            text_seed="Initial content"
        ).id
        for _ in range(2):  # Create 2 additional versions
            LocationProfileService.create_new_version(
                source_text=LocationProfileModel.objects.get(id=location_profile_id),
                user=self.user_1,
                version_type="edit",
                name="Updated Location",
                text_seed="Updated seed",
                text_content="Updated content"
            )

        # Perform the GraphQL query to list all location versions
        location_key = str(LocationProfileModel.objects.get(id=location_profile_id).location_key)
        query = f'''
        query {{
            listLocationVersions(projectId: "{str(self.project_id)}", locationKey: "{location_key}") {{
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
        data = response['data']['listLocationVersions']
        self.assertEqual(len(data), 3)  # Initial + 2 new versions
        self.assertEqual(data[0]['versionNumber'], 1)  # Check the version number of the first version

    def test_update_location_version_label(self):
        # Setup - create a location text version
        location_profile = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Location for Label Update",
            text_seed="Location content"
        )

        # Perform the GraphQL mutation to update the version label
        new_version_label = "Reviewed Version"
        mutation = f'''
        mutation {{
            updateLocationVersionLabel(projectId: "{str(self.project_id)}", locationProfileId: "{str(location_profile.id)}", versionLabel: "{new_version_label}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the version label was updated
        data = response['data']['updateLocationVersionLabel']
        self.assertTrue(data['success'])

        # Additional assertion to verify the version label was updated in the database
        updated_location_profile = LocationProfileModel.objects.get(id=location_profile.id)
        self.assertEqual(updated_location_profile.version_label, new_version_label)

    def test_rebase_location_profile_version(self):
        # Setup - create a location text and multiple versions to rebase
        location_profile = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Location to Rebase",
            text_seed="Initial seed"
        )
        for _ in range(2):  # Create 2 additional versions
            LocationProfileService.create_new_version(
                source_text=LocationProfileModel.objects.get(id=location_profile.id),
                user=self.user_1,
                version_type="edit",
                name="Updated Location",
                text_seed="Updated seed",
                text_content="Updated content"
            )

        # Get the ID of the version to rebase to (latest version for this test)
        versions = LocationProfileModel.objects(location_key=location_profile.location_key).order_by('-version_number')
        version_to_rebase_to = versions.first()

        # Perform the GraphQL mutation to rebase the location text to a specified version
        mutation = f'''
        mutation {{
            rebaseLocationProfile(projectId: "{str(self.project_id)}", locationProfileId: "{str(version_to_rebase_to.id)}") {{
                success
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and the rebase was done
        data = response['data']['rebaseLocationProfile']
        self.assertTrue(data['success'])

        # Additional assertion to verify only one version remains after the rebase
        remaining_versions = LocationProfileModel.objects(location_key=location_profile.location_key)
        self.assertEqual(remaining_versions.count(), 1, "More than one version remains after rebase.")
        rebased_version = remaining_versions.first()
        self.assertEqual(rebased_version.version_type, 'base', "Rebased version is not set as 'base'.")
        self.assertEqual(rebased_version.version_number, 1, "Rebased version number is not set as 1.")

    def test_update_location_profile(self):
        # Setup - create a location text to update
        location_profile = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Location to Update",
            text_seed="Initial seed"
        )

        # Define the updates to apply to the location text
        update_fields = {
            "name": "Updated Location Title",
            "text_seed": "Updated seed text",
            "text_notes": "Some insightful notes",
            "text_content": "The actual content of the location text",
        }

        # Perform the GraphQL mutation to update the location text
        mutation = f'''
        mutation {{
            updateLocationProfile(projectId: "{str(self.project_id)}", textId: "{str(location_profile.id)}", name: "{update_fields['name']}", textSeed: "{update_fields['text_seed']}", textNotes: "{update_fields['text_notes']}", textContent: "{update_fields['text_content']}") {{
                locationProfile {{
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

        # Assert that the response is successful and the location text was updated
        location_profile_data = response['data']['updateLocationProfile']['locationProfile']
        self.assertEqual(location_profile_data['name'], update_fields['name'])
        self.assertEqual(location_profile_data['textSeed'], update_fields['text_seed'])
        self.assertEqual(location_profile_data['textNotes'], update_fields['text_notes'])
        self.assertEqual(location_profile_data['textContent'], update_fields['text_content'])

        # Additional assertion to verify a new location text version was created
        versions_after_update = LocationProfileModel.objects(location_key=location_profile.location_key).order_by('-version_number')
        self.assertGreater(len(versions_after_update), 1, "No new version was created.")
        latest_version = versions_after_update.first()
        self.assertEqual(latest_version.name, update_fields['name'], "Title was not updated.")
        self.assertEqual(latest_version.text_seed, update_fields['text_seed'], "Text seed was not updated.")
        self.assertEqual(latest_version.text_notes, update_fields['text_notes'], "Text notes were not updated.")
        self.assertEqual(latest_version.text_content, update_fields['text_content'], "Text content was not updated.")
        self.assertEqual(latest_version.created_by.id, self.user_1.id, "Created by user is incorrect.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_location_from_seed(self, mock_pika):
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
        location_profile_system_role = PromptTemplateService.register_prompt_template(
            name="location_profile_system_role_from_seed",
            reference_key="location_profile_system_role_from_seed",
            prompt_text="location_profile_system_role_prompt_template",
            user_context=self.user_1,
        )
        location_profile_prompt_text = PromptTemplateService.register_prompt_template(
            name="location_profile_prompt_text_from_seed",
            reference_key="location_profile_prompt_text_from_seed",
            prompt_text="location_profile_prompt_text_prompt_template",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateLocationFromSeed', {"system_role": str(location_profile_system_role.id), "user_prompt": str(location_profile_prompt_text.id)})

        # Setup - create a location text to generate from seed
        location_profile = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Initial Location",
            text_seed="Seed for generation"
        )

        # Perform the GraphQL mutation to generate location from seed
        mutation = f'''
        mutation {{
            generateLocationFromSeed(projectId: "{str(self.project_id)}", textId: "{str(location_profile.id)}", textSeed: "{location_profile.text_seed}") {{
                agentTaskId
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and an agentTaskId is returned
        data = response['data']['generateLocationFromSeed']
        self.assertIsNotNone(data['agentTaskId'], "agentTaskId is None.")

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_location_with_notes(self, mock_pika):
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
        location_profile_system_role = PromptTemplateService.register_prompt_template(
            name="location_profile_system_role_with_notes",
            reference_key="location_profile_system_role_with_notes",
            prompt_text="location_profile_system_role_prompt_template",
            user_context=self.user_1,
        )
        location_profile_prompt_text = PromptTemplateService.register_prompt_template(
            name="location_profile_prompt_text_with_notes",
            reference_key="location_profile_prompt_text_with_notes",
            prompt_text="location_profile_prompt_text_prompt_template",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateLocationWithNotes', {"system_role": str(location_profile_system_role.id), "user_prompt": str(location_profile_prompt_text.id)})

        location_profile_system_role_with_notes_selective = PromptTemplateService.register_prompt_template(
            name="location_profile_system_role_with_notes_selective",
            reference_key="location_profile_system_role_with_notes_selective",
            prompt_text="location_profile_system_role_with_notes_selective",
            user_context=self.user_1,
        )
        location_profile_prompt_text_with_notes_selective = PromptTemplateService.register_prompt_template(
            name="location_profile_prompt_text_with_notes_selective",
            reference_key="location_profile_prompt_text_with_notes_selective",
            prompt_text="location_profile_prompt_text_with_notes_selective",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateLocationWithNotes.selective', {"system_role": str(location_profile_system_role_with_notes_selective.id), "user_prompt": str(location_profile_prompt_text_with_notes_selective.id)})

        # Setup - create a location text to generate from notes
        location_profile = LocationProfileService.create_location_profile(
            project_id=str(self.project_id),
            user=self.user_1,
            name="Initial Location",
            text_seed="Seed for generation"
        )

        # Perform the GraphQL mutation to generate location from notes
        mutation = f'''
        mutation {{
            generateLocationWithNotes(projectId: "{str(self.project_id)}", textId: "{str(location_profile.id)}", textNotes: "{location_profile.text_notes}") {{
                agentTaskId
            }}
        }}
        '''
        response = self.query_user_1(mutation)

        # Assert that the response is successful and an agentTaskId is returned
        data = response['data']['generateLocationWithNotes']
        self.assertIsNotNone(data['agentTaskId'], "agentTaskId is None.")

    def tearDown(self):
        super().tearDown()
        # Cleanup - delete the locations created for this test
        LocationProfileModel.objects.delete()
        PromptTemplateModel.objects.delete()
        ProjectModel.objects.delete()
