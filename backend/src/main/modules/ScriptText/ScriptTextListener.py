from .ScriptTextService import ScriptTextService
from .ScriptTextModel import ScriptTextModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class ScriptTextListener:

    @staticmethod
    def broadcast(script_text, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'script_text',
            'document_id': str(script_text.id),
            'event_type': event_type
        }

        # The channel to broadcast on should be 'script_text-<script_text ID>'
        channel_name = f"project-{str(script_text.getProject().id)}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def script_text_init_listener(event):
        ScriptTextListener.broadcast(event.data['script_text'], event.type)
        return

    @staticmethod
    def script_text_new_version_listener(event):
        ScriptTextListener.broadcast(event.data['script_text'], event.type)
        return

    @staticmethod
    def script_text_rebased_listener(event):
        ScriptTextListener.broadcast(event.data['script_text'], event.type)
        return

    @staticmethod
    def script_text_version_label_listener(event):
        ScriptTextListener.broadcast(event.data['script_text'], event.type)
        return


    def register_listeners(self):
        #ScriptText
        script_text_service = ScriptTextService.events
        script_text_service.register('script_text_init', self.script_text_init_listener)
        script_text_service.register('script_text_new_version', self.script_text_new_version_listener)
        script_text_service.register('script_text_rebased', self.script_text_rebased_listener)
        script_text_service.register('script_text_version_label', self.script_text_version_label_listener)
