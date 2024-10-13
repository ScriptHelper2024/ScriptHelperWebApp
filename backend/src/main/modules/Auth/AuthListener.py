from .AuthService import AuthService

class AuthListener:

    @staticmethod
    def user_authenticated_listener(event):
        # logic to trigger when a user is authenticated
        pass

    @staticmethod
    def user_logged_out_listener(event):
        # logic to trigger when a user logs out
        pass

    @staticmethod
    def user_email_verified_listener(event):
        #logic for when a user becomes verified
        pass

    @staticmethod
    def user_password_reset_listener(event):
        #logic for when a user resets their password
        pass


    def register_events(self):
        # AUTH EVENTS
        auth_event_service = AuthService.auth_events
        auth_event_service.register('user_authenticated', self.user_authenticated_listener)
        auth_event_service.register('user_logged_out', self.user_logged_out_listener)
        auth_event_service.register('user_email_verified', self.user_email_verified_listener)
        auth_event_service.register('user_password_reset', self.user_password_reset_listener)
