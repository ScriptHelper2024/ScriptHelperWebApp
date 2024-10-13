from .SceneTextService import SceneTextService
from .SceneTextModel import SceneTextModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class SceneTextListener:

    @staticmethod
    def broadcast(scene_text, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'scene_text',
            'document_id': str(scene_text.id),
            'title': scene_text.title,
            'scene_key': str(scene_text.scene_key),
            'scene_order': scene_text.scene_order,
            'version_number': scene_text.version_number,
            'version_type': scene_text.version_type,
            'version_label': scene_text.version_label,
            'event_type': event_type
        }

        # The channel to broadcast on
        channel_name = f"project-{str(scene_text.project_id.id)}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def scene_created_listener(event):
        SceneTextListener.broadcast(event.data['scene_text'], event.type)
        return

    @staticmethod
    def scene_deleted_listener(event):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'scene_text',
            'document_id': None,
            'scene_key': str(event.data['scene_key']),
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
    def scene_reordered_listener(event):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'scene_text',
            'document_id': None,
            'scene_key': str(event.data['scene_key']),
            'scene_order': event.data['new_order'],
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
    def scene_text_new_version_listener(event):
        SceneTextListener.broadcast(event.data['scene_text'], event.type)
        return

    @staticmethod
    def scene_text_rebased_listener(event):
        SceneTextListener.broadcast(event.data['scene_text'], event.type)
        return

    @staticmethod
    def scene_text_version_label_listener(event):
        SceneTextListener.broadcast(event.data['scene_text'], event.type)
        return


    def register_listeners(self):
        #SceneText
        scene_text_service = SceneTextService.events
        scene_text_service.register('scene_created', self.scene_created_listener)
        scene_text_service.register('scene_deleted', self.scene_deleted_listener)
        scene_text_service.register('scene_reordered', self.scene_reordered_listener)

        scene_text_service.register('scene_text_new_version', self.scene_text_new_version_listener)
        scene_text_service.register('scene_text_rebased', self.scene_text_rebased_listener)
        scene_text_service.register('scene_text_version_label', self.scene_text_version_label_listener)
