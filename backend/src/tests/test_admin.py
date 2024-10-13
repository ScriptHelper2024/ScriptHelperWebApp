# test_admin.py
import unittest
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.Admin.AdminService import AdminService

class TestAdmin(BaseTestCase):

    def setUp(self):
        super().setUp()
        # Create a project to use for the tests, which also initializes story text
        self.project_id = self.create_project_for_test(self.admin)

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

    def test_platform_statistics_query(self):
        query = '''
        query PlatformStatistics {
          platformStatistics(startDate: "", endDate: "") {
            project
            storyText
          }
        }
        '''

        # Execute the query as an admin
        response = self.query_admin(query)

        # Check that there are no errors in the response
        self.assertNotIn('errors', response, f"GraphQL Error: {response.get('errors')}")

        # Verify the counts
        data = response['data']['platformStatistics']
        self.assertEqual(data['project'], 1, "Project count should be 1")
        self.assertEqual(data['storyText'], 1, "StoryText count should be 1")

    def test_register_platform_setting(self):
        key = "test_setting_register"
        value = {"key": "value"}
        # Attempt to clean up before test in case previous test run failed
        try:
            AdminService.unregister_platform_setting(key)
        except ValueError:
            pass  # Ignore if setting doesn't exist

        # Test registering a new platform setting
        setting = AdminService.register_platform_setting(key, value)
        self.assertIsNotNone(setting, "Failed to register platform setting.")

        # Verify registration was successful
        fetched_setting = AdminService.get_platform_setting(key)
        self.assertEqual(fetched_setting.key, key)
        self.assertEqual(fetched_setting.value, value)

        # Clean up
        AdminService.unregister_platform_setting(key)

    def test_unregister_platform_setting(self):
        key = "test_setting_unregister"
        value = "Some value"
        # Ensure the setting is registered before attempting to unregister
        AdminService.register_platform_setting(key, value)
        AdminService.unregister_platform_setting(key)
        with self.assertRaises(ValueError):
            AdminService.get_platform_setting(key)

    def test_update_platform_setting(self):
        key = "test_setting_update"
        original_value = {"key": "original_value"}
        new_value = "New Value"
        # Ensure the setting is registered before attempting to update
        AdminService.register_platform_setting(key, original_value)
        mutation = f'''
        mutation {{
            updatePlatformSetting(key: "{key}", value: "{new_value}") {{
                success
            }}
        }}
        '''
        update_response = self.query_admin(mutation)
        self.assertNotIn('errors', update_response, f"GraphQL Error: {update_response.get('errors')}")
        self.assertTrue(update_response['data']['updatePlatformSetting']['success'], "Update mutation did not succeed.")
        # Clean up
        AdminService.unregister_platform_setting(key)

    def test_get_platform_setting(self):
        key = "test_setting_get"
        value = "Some value"
        # Ensure the setting is registered before attempting to fetch
        AdminService.register_platform_setting(key, value)
        query = f'''
        query {{
            platformSetting(key: "{key}") {{
                key
                value
            }}
        }}
        '''
        query_response = self.query_admin(query)
        self.assertNotIn('errors', query_response, f"GraphQL Error: {query_response.get('errors')}")
        fetched_setting = query_response['data']['platformSetting']
        self.assertEqual(fetched_setting['key'], key, "Fetched key does not match.")
        self.assertEqual(fetched_setting['value'], value, "Fetched value does not match.")
        # Clean up
        AdminService.unregister_platform_setting(key)

    def test_list_platform_settings(self):
        # GraphQL query to fetch all platform settings
        query = '''
        query ListPlatformSettings {
            listPlatformSettings {
                key
                value
            }
        }
        '''

        # Execute the query as an admin
        response = self.query_admin(query)

        # Ensure no errors in the response
        self.assertNotIn('errors', response, f"GraphQL Error: {response.get('errors')}")

        # Extract data from the response
        settings_list = response['data']['listPlatformSettings']

        # Validate that we have received more than 0 settings
        self.assertGreater(len(settings_list), 0, "No platform settings returned.")
