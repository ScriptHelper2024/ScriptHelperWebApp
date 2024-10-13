from authlib.integrations.flask_client import OAuth
from flask import current_app as app, url_for
from .AuthService import AuthService
from main.modules.User.UserService import UserService
from main.modules.User.UserModel import UserModel
from main.config.oauth import configure_oauth
import os

# Exception class for OAuth login errors
class OAuthLoginError(Exception):
    pass

# Initialize and configure the OAuth instance
oauth = configure_oauth(app)

class OAuthService:
    @staticmethod
    def get_authorization_url(provider):
        if provider not in oauth._registry:
            raise OAuthLoginError('Unsupported provider')

        # Get the frontend redirect URI base from environment variables
        frontend_redirect_base = os.getenv('FRONTEND_OAUTH_REDIRECT_BASE')

        # Ensure the FRONTEND_OAUTH_REDIRECT_BASE environment variable is set
        if not frontend_redirect_base:
            raise OAuthLoginError('Environment variable for frontend OAuth redirect base is not set')

        # Append the provider to the redirect URI base
        redirect_uri = f"{frontend_redirect_base}/{provider}"

        # Generate the authorization URL
        return oauth.create_client(provider).authorize_redirect(redirect_uri)

    @staticmethod
    def finalize_login(provider, code):
        oauth_client = oauth.create_client(provider)
        if oauth_client is None:
            raise OAuthLoginError('Unsupported provider')

        # Exchange code for the provider's access token
        token = oauth_client.authorize_access_token(code)

        # Fetch the user info from the provider
        userinfo_resp = oauth_client.get('userinfo')
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()

        email = userinfo.get('email')
        if email is None:
            raise OAuthLoginError('Failed to fetch user email from provider')

        # Attempt to extract first name and last name using various possible keys
        first_name = userinfo.get('first_name', None) or userinfo.get('given_name', None)
        last_name = userinfo.get('last_name', None) or userinfo.get('family_name', None)

        # If both first_name and last_name are not available, check for a "name" field
        if not first_name or not last_name:
            full_name = userinfo.get('name', None)
            if full_name:
                parts = full_name.split(' ', 1)
                first_name = first_name or parts[0]
                last_name = last_name or (parts[1] if len(parts) > 1 else None)

        user = UserModel.objects(email=email).first()

        if user:
            # Check if the user is linked to the OAuth provider
            if user.metadata.get(f'oauth_{provider}') is None:
                raise OAuthLoginError('Existing account not linked to this OAuth provider.')
        else:
            # Register a new user with OAuth details, including first and last name if available
            user_id, _ = UserService.register_user(
                email,
                first_name=first_name,
                last_name=last_name,
                password=None,
                oauth_provider=provider,
                oauth_token=token['access_token']
            )
            user = UserModel.objects(id=user_id).first()

        # Update or set OAuth token in user metadata
        user.metadata[f'oauth_{provider}'] = {'oauth_token': token['access_token']}
        user.save()

        # Clear the cache for the user
        UserService.clear_user_cache(user.id, user.email)

        # Authenticate the user using OAuth mode
        access_token = AuthService.authenticate_user(email, oauth_mode=True)

        return access_token
