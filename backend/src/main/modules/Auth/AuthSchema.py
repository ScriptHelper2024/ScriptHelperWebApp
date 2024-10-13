# Import needed modules
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType
from .AuthService import AuthService
from graphql import GraphQLError
from .OAuthService import OAuthService, OAuthLoginError

# Define Login Mutation. It takes in email and password, and returns an access token.
class LoginMutation(Mutation):
    class Arguments:
        email = String(required=True)
        password = String(required=True)

    access_token = String()

    def mutate(self, info, email, password):
        # Attempt to authenticate user with provided credentials.
        try:
            access_token = AuthService.authenticate_user(email, password)
            return LoginMutation(access_token=access_token)
        except ValueError as e:
            # If there's any error during authentication, raise a GraphQL error.
            raise GraphQLError(str(e))

# Define Logout Mutation. It takes in no arguments and returns a boolean indicating success.
class LogoutMutation(Mutation):
    class Arguments:
        pass

    success = Boolean()

    def mutate(self, info):
        # Attempt to revoke the user's token.
        try:
            success = AuthService.revoke_token(info.context['user'])
            return LogoutMutation(success=success)
        except ValueError as e:
            # If there's any error during revoking the token, raise a GraphQL error.
            raise GraphQLError(str(e))

# Define SendEmailVerification Mutation. It takes in no arguments and returns a boolean indicating success.
class SendEmailVerificationMutation(Mutation):
    class Arguments:
        pass

    success = Boolean()

    def mutate(self, info):
        # Attempt to send an email verification to the user.
        try:
            user = info.context['user']
            success = AuthService.send_email_verification(user)
            return SendEmailVerificationMutation(success=success)
        except ValueError as e:
            # If there's any error during sending the email, raise a GraphQL e
            raise GraphQLError(str(e))

# Define VerifyEmail Mutation. It takes in an email verification code and returns a boolean indicating success.
class VerifyEmailMutation(Mutation):
    class Arguments:
        code = String(required=True)

    success = Boolean()

    def mutate(self, info, code):
        # Attempt to verify the user's email with the provided code.
        try:
            success = AuthService.verify_email(code)
            return VerifyEmailMutation(success=success)
        except ValueError as e:
            # If there's any error during verification, raise a GraphQL error.
            raise GraphQLError(str(e))

# Define PasswordResetRequest Mutation. It takes in an email and returns a boolean indicating success.
class PasswordResetRequestMutation(Mutation):
    class Arguments:
        email = String(required=True)

    success = Boolean()

    def mutate(self, info, email):
        # Attempt to initiate a password reset request for the provided email.
        try:
            success = AuthService.request_password_reset(email)
            return PasswordResetRequestMutation(success=success)
        except ValueError as e:
            # If there's any error during the request, raise a GraphQL error.
            raise GraphQLError(str(e))


# Define PasswordReset Mutation. It takes in a reset code, an email, and a new password, and returns a boolean indicating success.
class PasswordResetMutation(Mutation):
    class Arguments:
        reset_code = String(required=True)
        email = String(required=True)
        new_password = String(required=True)

    success = Boolean()

    # Attempt to reset the user's password with the provided reset code and new password.
    def mutate(self, info, reset_code, email, new_password):
        try:
            success = AuthService.reset_password(reset_code, email, new_password)
            return PasswordResetMutation(success=success)
        except ValueError as e:
            # If there's any error during the password reset, raise a GraphQL error.
            raise GraphQLError(str(e))


class SocialLoginMutation(Mutation):
    class Arguments:
        provider = String(required=True)

    authorization_url = String()

    def mutate(self, info, provider):
        try:
            authorization_url = OAuthService.get_authorization_url(provider)
            return SocialLoginMutation(authorization_url=authorization_url)
        except OAuthLoginError as e:
            raise GraphQLError(str(e))


class FinalizeSocialLoginMutation(Mutation):
    class Arguments:
        provider = String(required=True)
        code = String(required=True)

    access_token = String()

    def mutate(self, info, provider, code):
        try:
            access_token = OAuthService.finalize_login(provider, code)
            return FinalizeSocialLoginMutation(access_token=access_token)
        except OAuthLoginError as e:
            raise GraphQLError(str(e))


def get_query_fields():
    return {}

def get_mutation_fields():
    return {
        'login': LoginMutation.Field(),
        'logout': LogoutMutation.Field(),
        'send_email_verification': SendEmailVerificationMutation.Field(),
        'verify_email': VerifyEmailMutation.Field(),
        'password_reset_request': PasswordResetRequestMutation.Field(),
        'password_reset': PasswordResetMutation.Field(),
        'social_login': SocialLoginMutation.Field(),
        'finalize_social_login': FinalizeSocialLoginMutation.Field()
    }
