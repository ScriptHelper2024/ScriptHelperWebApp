import unittest
from unittest.mock import patch
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel

class TestUser(BaseTestCase):

    def test_user_by_id(self):
        query = f'''
        query {{
            userById(id: "{self.user_1.id}") {{
                id
                email
            }}
        }}
        '''
        response = response = self.query_admin(query)
        self.assertEqual(response["data"]["userById"]["id"], str(self.user_1.id))

    def test_user_by_email(self):
        query = f'''
        query {{
            userByEmail(email: "{self.user_1.email}") {{
                id
                email
            }}
        }}
        '''

        response = self.query_admin(query)
        self.assertEqual(response["data"]["userByEmail"]["email"], self.user_1.email)

    def test_all_users(self):
        query = '''
        query {
            allUsers {
                users {
                    id
                    email
                }
                pages
                statistics {
                    totalUsersCount
                    verifiedUsersCount
                }
            }
        }
        '''
        response = self.query_admin(query)

        data = response["data"]["allUsers"]
        if data is not None:
            users = data["users"]
            pages = data["pages"]
            statistics = data["statistics"]

            # Check if the users list is not empty.
            self.assertGreaterEqual(len(users), 1)

            # Check if pages is a non-negative integer.
            self.assertIsInstance(pages, int)
            self.assertGreaterEqual(pages, 0)
            self.assertIsInstance(statistics, object)
        else:
            self.fail("allUsers query did not return any data.")

    def test_update_user(self):
        # Adding password field to mutation
        mutation = f'''
        mutation {{
            updateUser(id: "{self.user_1.id}", email: "newtest123@example.com", password: "newpassword123") {{
                user {{
                    id
                    email
                }}
            }}
        }}
        '''
        response = self.query_admin(mutation)
        self.user_email = response["data"]["updateUser"]["user"]["email"]
        self.assertEqual(response["data"]["updateUser"]["user"]["email"], "newtest123@example.com")

    def test_delete_user(self):

        # Delete the second user
        mutation = f'''
        mutation {{
            deleteUser(id: "{self.user_2.id}")
        }}
        '''
        response = self.query_admin(mutation)
        self.assertTrue(response["data"]["deleteUser"], "Delete mutation for the second user did not return a successful response.")

    def test_me(self):
        query = '''
        query {
            me {
                id
                email
            }
        }
        '''
        response = self.query_user_1(query)
        self.assertEqual(response["data"]["me"]["id"], str(self.user_1.id))
        self.assertEqual(response["data"]["me"]["email"], self.user_1.email)

    def test_update_me(self):
        mutation = '''
        mutation {
            updateMe(email: "newtest@example.com", password: "newpassword123") {
                user {
                    id
                    email
                }
            }
        }
        '''
        response = self.query_admin(mutation)
        self.assertEqual(response["data"]["updateMe"]["user"]["email"], "newtest@example.com")

if __name__ == "__main__":
    unittest.main()
