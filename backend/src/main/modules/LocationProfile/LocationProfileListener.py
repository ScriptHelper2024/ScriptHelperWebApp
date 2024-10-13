from .LocationProfileService import LocationProfileService
from .LocationProfileModel import LocationProfileModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class LocationProfileListener:

    @staticmethod
    def broadcast(location_profile, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'location_profile',
            'document_id': str(location_profile.id),
            'name': location_profile.name,
            'location_key': str(location_profile.location_key),
            'location_order': location_profile.location_order,
            'version_number': location_profile.version_number,
            'version_type': location_profile.version_type,
            'version_label': location_profile.version_label,
            'event_type': event_type
        }

        # The channel to broadcast on
        channel_name = f"project-{str(location_profile.project_id.id)}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def location_created_listener(event):
        LocationProfileListener.broadcast(event.data['location_profile'], event.type)
        return

    @staticmethod
    def location_deleted_listener(event):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'location_profile',
            'document_id': None,
            'location_key': str(event.data['location_key']),
            'event_type': event.type
        }

        # The channel to broadcast on
        channel_name = f"project-{event.data['project_id']}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def location_reordered_listener(event):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'location_profile',
            'document_id': None,
            'location_key': str(event.data['location_key']),
            'location_order': event.data['new_order'],
            'event_type': event.type
        }

        # The channel to broadcast on
        channel_name = f"project-{event.data['project_id']}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def location_profile_new_version_listener(event):
        LocationProfileListener.broadcast(event.data['location_profile'], event.type)
        return

    @staticmethod
    def location_profile_rebased_listener(event):
        LocationProfileListener.broadcast(event.data['location_profile'], event.type)
        return

    @staticmethod
    def location_profile_version_label_listener(event):
        LocationProfileListener.broadcast(event.data['location_profile'], event.type)
        return


    def register_listeners(self):
        #LocationProfile
        location_profile_service = LocationProfileService.events
        location_profile_service.register('location_created', self.location_created_listener)
        location_profile_service.register('location_deleted', self.location_deleted_listener)
        location_profile_service.register('location_reordered', self.location_reordered_listener)

        location_profile_service.register('location_profile_new_version', self.location_profile_new_version_listener)
        location_profile_service.register('location_profile_rebased', self.location_profile_rebased_listener)
        location_profile_service.register('location_profile_version_label', self.location_profile_version_label_listener)
