from .BeatSheetService import BeatSheetService
from .BeatSheetModel import BeatSheetModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class BeatSheetListener:

    @staticmethod
    def broadcast(beat_sheet, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'beat_sheet',
            'document_id': str(beat_sheet.id),
            'event_type': event_type
        }

        # The channel to broadcast on should be 'beat_sheet-<beat_sheet ID>'
        channel_name = f"project-{str(beat_sheet.getProject().id)}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def beat_sheet_init_listener(event):
        BeatSheetListener.broadcast(event.data['beat_sheet'], event.type)
        return

    @staticmethod
    def beat_sheet_new_version_listener(event):
        BeatSheetListener.broadcast(event.data['beat_sheet'], event.type)
        return

    @staticmethod
    def beat_sheet_rebased_listener(event):
        BeatSheetListener.broadcast(event.data['beat_sheet'], event.type)
        return

    @staticmethod
    def beat_sheet_version_label_listener(event):
        BeatSheetListener.broadcast(event.data['beat_sheet'], event.type)
        return


    def register_listeners(self):
        #BeatSheet
        beat_sheet_service = BeatSheetService.events
        beat_sheet_service.register('beat_sheet_init', self.beat_sheet_init_listener)
        beat_sheet_service.register('beat_sheet_new_version', self.beat_sheet_new_version_listener)
        beat_sheet_service.register('beat_sheet_rebased', self.beat_sheet_rebased_listener)
        beat_sheet_service.register('beat_sheet_version_label', self.beat_sheet_version_label_listener)
