import unittest
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel
from main.modules.UserPreference.UserPreferenceModel import UserPreferenceModel
from collections import OrderedDict
import json

def mutation_update_my_user_preference(**kwargs): return f'''
    mutation {{
        updateMyUserPreference({', '.join([f'{k}:"{v}"' for k, v in kwargs.items()])}) {{
            userPreference {{
                defaultLlm
            }}
        }}
    }}
'''

def mutation_update_user_preference(**kwargs): return f'''
    mutation {{
        updateUserPreference({', '.join([f'{k}:"{v}"' for k, v in kwargs.items()])}) {{
            userPreference {{
                defaultLlm
            }}
        }}
    }}
'''

def query_get_user_preference_by_user_id(id): return f'''
    query {{
        userPreferenceByUserId(id: "{id}") {{
            defaultLlm
        }}
    }}
'''

class TestUserPreference(BaseTestCase):

    def setUp(self):
        super().setUp()

        # Get the default LLM options
        query = '''
            query {
                defaultLlmOptions {
                    defaultLlmOptions
                }
            }
        '''
        response = self.query_user_1(query)
        self.default_llm_options = OrderedDict(json.loads(response["data"]["defaultLlmOptions"]["defaultLlmOptions"]))

    def test_default_llm_options(self):
        # check that there are default LLM options
        assert len(self.default_llm_options) > 0

    def test_get_my_preferences(self):
        # test getting a user's own preferences
        query = '''
            query MyUserPreference {
                myUserPreference {
                    defaultLlm
                }
            }
        '''
        response = self.query_user_1(query)
        default_llm = response["data"]["myUserPreference"]["defaultLlm"]

        # verify settings
        assert default_llm == 'auto' # test the default value

    def test_set_my_preferences(self):
        # test setting a user's own preferences

        default_llm = list(self.default_llm_options.items())[1][0]
        response = self.query_user_1(mutation_update_my_user_preference(
                defaultLlm=default_llm))

        assert default_llm == response["data"]["updateMyUserPreference"]["userPreference"]["defaultLlm"]

    def test_get_user_preferences(self):
        # test getting a user's preferences as an admin

        default_llm = list(self.default_llm_options.items())[2][0]

        # set user's preferences first
        response = self.query_user_1(mutation_update_my_user_preference(defaultLlm=default_llm))
        default_llm = response['data']['updateMyUserPreference']['userPreference']["defaultLlm"]

        # get users's preference settings
        response = self.query_admin(query_get_user_preference_by_user_id(id=self.user_1.id))

        # verify settings
        assert default_llm == response["data"]["userPreferenceByUserId"]["defaultLlm"]

    def test_set_user_preferences_as_admin(self):
        # test setting a user's preferences as an admin

        default_llm = list(self.default_llm_options.items())[3][0]
        # set the normal user's preferences as admin
        response = self.query_admin(mutation_update_user_preference(id=self.user_1.id, defaultLlm=default_llm))
        default_llm = response['data']['updateUserPreference']['userPreference']["defaultLlm"]

        # get users's preference settings
        response = self.query_admin(query_get_user_preference_by_user_id(id=self.user_1.id))

        # verify settings
        assert default_llm == response["data"]["userPreferenceByUserId"]["defaultLlm"]

    def test_get_user_preferences_not_admin(self):
        # test getting a user's preferences as an admin

        # get users's preference settings as non admin
        response = self.query_user_1(query_get_user_preference_by_user_id(self.admin.id))

        # verify request fails because user is not an admin
        assert response['errors'][0]['message'] == 'Not authorized: insufficient admin level'

    def test_set_user_preferences_not_admin(self):
        # test setting a user's preferences as an admin

        default_llm = list(self.default_llm_options.items())[4][0]

        # set the user's preferences as non admin
        response = self.query_user_1(mutation_update_user_preference(id=self.admin.id, defaultLlm=default_llm))

        # verify request fails because user is not an admin
        assert response['errors'][0]['message'] == 'Not authorized: insufficient admin level'


if __name__ == "__main__":
    unittest.main()
