import unittest
from main.modules.User.UserModel import UserModel
from main.modules.Auth.PasswordResetRequestModel import PasswordResetRequestModel
from tests import BaseTestCase

class TestAuth(BaseTestCase):

    def test_login(self):
        mutation = f'''
          mutation {{
            login(email: "{self.user_1.email}", password: "password") {{
              accessToken
            }}
          }}
        '''
        response = self.query_user_1(mutation)
        if response is not None:
            new_access_token = response["data"]["login"]["accessToken"]
        else:
            self.fail("Login mutation did not return a successful response.")

    def test_resend_email_verification(self):
        mutation = '''
          mutation {
            sendEmailVerification {
              success
            }
          }
        '''
        response = self.query_user_1(mutation)
        if response is not None:
            self.assertTrue(response["data"]["sendEmailVerification"]["success"])
        else:
            self.fail("Resend email verification mutation did not return a successful response.")

    def test_verify_email(self):
        mutation = f'''
            mutation {{
                verifyEmail(code: "{self.user_1.verification_code}") {{
                    success
                }}
            }}
        '''
        response = self.query_user_1(mutation)
        if response is not None:
            self.assertTrue(response["data"]["verifyEmail"]["success"])
        else:
            self.fail("Verify email mutation did not return a successful response.")

    def test_request_password_reset(self):
        mutation = f'''
          mutation {{
            passwordResetRequest(email: "{self.user_1.email}") {{
              success
            }}
          }}
        '''
        response = self.query_user_1(mutation)
        if response is not None:
            self.assertTrue(response["data"]["passwordResetRequest"]["success"])
        else:
            self.fail("Password reset request mutation did not return a successful response.")

    def test_reset_password_and_login_with_new(self):
        self.test_request_password_reset()
        # Reset password
        password_reset_request = PasswordResetRequestModel.objects.filter(user=self.user_1.id, status='pending').order_by('-request_date').first()
        reset_code = password_reset_request.reset_code
        mutation = f'''
            mutation {{
                passwordReset(resetCode: "{reset_code}", email: "{self.user_1.email}", newPassword: "newPassword123") {{
                    success
                }}
            }}
        '''
        response = self.query_user_1(mutation)
        if response is not None:
            self.assertTrue(response["data"]["passwordReset"]["success"])
        else:
            self.fail("Password reset mutation did not return a successful response.")

        # Login with new password
        mutation = f'''
            mutation {{
                login(email: "{self.user_1.email}", password: "newPassword123") {{
                    accessToken
                }}
            }}
        '''
        response = self.query_user_1(mutation)

        if response is not None:
            self.assertIsNotNone(response["data"]["login"]["accessToken"])
        else:
            self.fail("Login mutation did not return a successful response.")

    def test_logout(self):
        # Now, we can log out this user
        mutation = '''
          mutation {
            logout {
              success
            }
          }
        '''
        response = self.query_user_1(mutation)

        if response is not None:
            self.assertTrue(response["data"]["logout"]["success"])
        else:
            self.fail("Logout mutation did not return a successful response.")

if __name__ == '__main__':
    unittest.main()
