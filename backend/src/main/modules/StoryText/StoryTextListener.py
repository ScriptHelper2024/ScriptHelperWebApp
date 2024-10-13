from .StoryTextService import StoryTextService
from .StoryTextModel import StoryTextModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class StoryTextListener:

    @staticmethod
    def broadcast(story_text, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'story_text',
            'document_id': str(story_text.id),
            'event_type': event_type
        }

        # The channel to broadcast on should be 'story_text-<story_text ID>'
        channel_name = f"project-{str(story_text.project_id.id)}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def story_text_init_listener(event):
        StoryTextListener.broadcast(event.data['story_text'], event.type)
        return

    @staticmethod
    def story_text_new_version_listener(event):
        StoryTextListener.broadcast(event.data['story_text'], event.type)
        return

    @staticmethod
    def story_text_rebased_listener(event):
        StoryTextListener.broadcast(event.data['story_text'], event.type)
        return

    @staticmethod
    def story_text_version_label_listener(event):
        StoryTextListener.broadcast(event.data['story_text'], event.type)
        return


    def register_listeners(self):
        #StoryText
        story_text_service = StoryTextService.events
        story_text_service.register('story_text_init', self.story_text_init_listener)
        story_text_service.register('story_text_new_version', self.story_text_new_version_listener)
        story_text_service.register('story_text_rebased', self.story_text_rebased_listener)
        story_text_service.register('story_text_version_label', self.story_text_version_label_listener)
