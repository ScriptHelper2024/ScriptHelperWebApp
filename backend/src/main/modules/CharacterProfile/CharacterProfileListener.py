from .CharacterProfileService import CharacterProfileService
from .CharacterProfileModel import CharacterProfileModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class CharacterProfileListener:

    @staticmethod
    def broadcast(character_profile, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'character_profile',
            'document_id': str(character_profile.id),
            'name': character_profile.name,
            'character_key': str(character_profile.character_key),
            'character_order': character_profile.character_order,
            'version_number': character_profile.version_number,
            'version_type': character_profile.version_type,
            'version_label': character_profile.version_label,
            'event_type': event_type
        }

        # The channel to broadcast on
        channel_name = f"project-{str(character_profile.project_id.id)}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def character_created_listener(event):
        CharacterProfileListener.broadcast(event.data['character_profile'], event.type)
        return

    @staticmethod
    def character_deleted_listener(event):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'character_profile',
            'document_id': None,
            'character_key': str(event.data['character_key']),
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
    def character_reordered_listener(event):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'character_profile',
            'document_id': None,
            'character_key': str(event.data['character_key']),
            'character_order': event.data['new_order'],
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
    def character_profile_new_version_listener(event):
        CharacterProfileListener.broadcast(event.data['character_profile'], event.type)
        return

    @staticmethod
    def character_profile_rebased_listener(event):
        CharacterProfileListener.broadcast(event.data['character_profile'], event.type)
        return

    @staticmethod
    def character_profile_version_label_listener(event):
        CharacterProfileListener.broadcast(event.data['character_profile'], event.type)
        return


    def register_listeners(self):
        #CharacterProfile
        character_profile_service = CharacterProfileService.events
        character_profile_service.register('character_created', self.character_created_listener)
        character_profile_service.register('character_deleted', self.character_deleted_listener)
        character_profile_service.register('character_reordered', self.character_reordered_listener)

        character_profile_service.register('character_profile_new_version', self.character_profile_new_version_listener)
        character_profile_service.register('character_profile_rebased', self.character_profile_rebased_listener)
        character_profile_service.register('character_profile_version_label', self.character_profile_version_label_listener)
