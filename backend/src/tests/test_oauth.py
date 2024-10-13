import unittest
from unittest.mock import patch
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel

class TestOAuth(BaseTestCase):

    @patch('authlib.integrations.flask_client.OAuth.create_client')
    def test_get_authorization_url(self, mock_oauth_client):
        # Mock the authorize_redirect method
        mock_client = mock_oauth_client.return_value
        mock_client.authorize_redirect.return_value = 'https://frontend.mock/authorize/google'

        query = '''
          mutation {
            socialLogin(provider: "google") {
              authorizationUrl
            }
          }
        '''
        response = self.query_user_1(query)

        self.assertIsNotNone(response["data"]["socialLogin"]["authorizationUrl"])

    @patch('authlib.integrations.flask_client.OAuth.create_client')
    def test_finalize_social_login(self, mock_oauth_client):
        # Mock the responses for authorize_access_token and get('userinfo') methods
        mock_client = mock_oauth_client.return_value
        unique_email = 'unique_oauth_test@example.com'
        mock_client.authorize_access_token.return_value = {'access_token': 'mocked_access_token'}
        mock_client.get.return_value.json.return_value = {'email': unique_email}

        # Simulate the OAuth flow for a new user
        new_user_query = '''
          mutation {
            finalizeSocialLogin(provider: "google", code: "mocked_code") {
              accessToken
            }
          }
        '''
        response = self.client.post('/graphql', json={'query': new_user_query})
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertIsNotNone(json_data["data"]["finalizeSocialLogin"]["accessToken"])

        # The user should now be registered in the system, so we try the OAuth flow again
        # This should simulate logging in as an existing user
        existing_user_query = '''
          mutation {
            finalizeSocialLogin(provider: "google", code: "mocked_code") {
              accessToken
            }
          }
        '''
        response = self.client.post('/graphql', json={'query': existing_user_query})
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertIsNotNone(json_data["data"]["finalizeSocialLogin"]["accessToken"])

        # Check that the user exists in the database and has logged in via OAuth previously
        user = UserModel.objects.get(email=unique_email)
        self.assertIsNotNone(user)
        self.assertIn('oauth_google', user.metadata)

        # Cleanup: remove the test user created
        UserModel.objects(email=unique_email).delete()
