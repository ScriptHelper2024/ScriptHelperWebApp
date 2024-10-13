import unittest
from unittest.mock import patch, MagicMock
from main.config.db import initialize_db
from main.app import create_app
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel


def mutation_user(user): return f'''
  mutation {{
    registerUser(email: "{user}@example.com", password: "password") {{
      user {{
        id
        email
        adminLevel
      }}
      accessToken
    }}
  }}
'''


class S(dict):
    """dot notation access to dictionary attributes"""
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__


class PatchMeta(type):

    def __new__(meta, name, bases, attrs):
        return super().__new__(meta, name, bases, attrs)


class BaseTestCase(unittest.TestCase, metaclass=PatchMeta):

    @classmethod
    def setUpClass(cls):
        # Mock the database
        mock_db_uri = 'mongodb://localhost'
        cls.connection = initialize_db(mock_db_uri, reconnect=True)

        cls.app = create_app()
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        cls.connection.drop_database("testdb")
        cls.app = None
        cls.client = None

    def setUp(self):
        # Register an admin user to use for the tests
        response_admin = self.client.post('/graphql', json={'query': mutation_user("admin")})
        assert response_admin.status_code == 200, "Admin registration mutation did not return a successful response."

        self.admin_access_token = response_admin.get_json()["data"]["registerUser"]["accessToken"]
        self.admin = UserModel.objects.get(id=response_admin.get_json()["data"]["registerUser"]["user"]["id"])
        self.admin.admin_level = 1
        self.admin.save()
        self.query_admin = lambda query: self.client.post('/graphql', json={'query': query}, headers={
            'Authorization': f'Bearer {self.admin_access_token}'
        }).get_json()

        # Register a regular user to use for the tests
        response_user_1 = self.client.post('/graphql', json={'query': mutation_user("user1")})
        assert response_user_1.status_code == 200, "Regular user registration mutation did not return a successful response."

        self.user_1_access_token = response_user_1.get_json()["data"]["registerUser"]["accessToken"]
        self.user_1 = UserModel.objects.get(id=response_user_1.get_json()["data"]["registerUser"]["user"]["id"])
        self.query_user_1 = lambda query: self.client.post('/graphql', json={'query': query}, headers={
            'Authorization': f'Bearer {self.user_1_access_token}'
        }).get_json()

        # Register a regular user to use for the tests
        response_user_2 = self.client.post('/graphql', json={'query': mutation_user("user2")})
        assert response_user_2.status_code == 200, "Regular user registration mutation did not return a successful response."

        self.user_2_access_token = response_user_2.get_json()["data"]["registerUser"]["accessToken"]
        self.user_2 = UserModel.objects.get(id=response_user_2.get_json()["data"]["registerUser"]["user"]["id"])
        self.query_user_2 = lambda query: self.client.post('/graphql', json={'query': query}, headers={
            'Authorization': f'Bearer {self.user_2_access_token}'
        }).get_json()

    def tearDown(self):
        UserModel.objects.delete()
        ProjectModel.objects.delete()
        StoryTextModel.objects.delete()
