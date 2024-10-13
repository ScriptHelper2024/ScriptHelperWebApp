from .SuggestedStoryTitleService import SuggestedStoryTitleService
from .SuggestedStoryTitleModel import SuggestedStoryTitleModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class SuggestedStoryTitleListener:

    @staticmethod
    def broadcast(suggestion, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'suggested_story_title',
            'document_id': str(suggestion.id),
            'title': suggestion.title,
            'event_type': event_type
        }

        # The channel to broadcast on should be 'suggested_title-<suggested_title ID>'
        channel_name = f"project-{str(suggestion.project_id.id)}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def suggested_story_title_created_listener(event):
        SuggestedStoryTitleListener.broadcast(event.data['suggestion'], event.type)
        return

    @staticmethod
    def suggested_story_title_deleted_listener(event):
        SuggestedStoryTitleListener.broadcast(event.data['suggestion'], event.type)
        return

    @staticmethod
    def suggested_story_title_applied_listener(event):
        SuggestedStoryTitleListener.broadcast(event.data['suggestion'], event.type)
        return


    def register_listeners(self):
        #SuggestedStoryTitle
        suggested_title_service = SuggestedStoryTitleService.events
        suggested_title_service.register('suggested_story_title_created', self.suggested_story_title_created_listener)
        suggested_title_service.register('suggested_story_title_deleted', self.suggested_story_title_deleted_listener)
        suggested_title_service.register('suggested_story_title_applied', self.suggested_story_title_applied_listener)
