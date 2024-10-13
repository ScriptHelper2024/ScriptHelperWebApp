from .UserService import UserService
from main.modules.Auth.AuthService import AuthService

class UserListener:

    @staticmethod
    def user_registered_listener(event):
        # Get the user who registered
        user_id = event.data
        user = UserService.find_by_id(user_id)

         # Send email verification
        AuthService.send_email_verification(user)

        return

    @staticmethod
    def user_updated_listener(event):
        """
        Listener that triggers when user details are updated.
        If the user's email is updated, it sends a reconfirmation email.
        """

        # Get the original and updated user from the event data
        original_user = event.data['original']
        updated_user = event.data['updated']

        # Check if the email has changed
        if original_user.email != updated_user.email:
            # If the email has changed, set email_verified to False
            updated_user.email_verified = False
            updated_user.save()

            # Send a new confirmation email
            AuthService.send_email_verification(updated_user)

            #clear the cache for the user
            UserService.clear_user_cache(updated_user.id, updated_user.email)            

    @staticmethod
    def user_deleted_listener(event):
        # Get the user who registered
        user = event.data
        return

    def register_listeners(self):
        #USER EVENTS
        event_service = UserService.user_events
        event_service.register('user_registered', self.user_registered_listener)
        event_service.register('user_updated', self.user_updated_listener)
        event_service.register('user_deleted', self.user_deleted_listener)
