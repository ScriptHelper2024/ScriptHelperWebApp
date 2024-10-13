from .ProjectService import ProjectService
from .ProjectModel import ProjectModel
from main.modules.User.UserModel import UserModel
from main.libraries.Websocket import Websocket

class ProjectListener:

    @staticmethod
    def broadcast(project, event_type):
        # Format the details for the WebSocket notification
        websocket_data = {
            'type': 'project',
            'project_id': str(project.id),
            'title': project.title,
            'event_type': event_type
        }

        # The channel to broadcast on should be 'project-<project ID>'
        channel_name = f"project-{project.id}"

        # Initialize the WebSocket utility class
        websocket_util = Websocket()

        # Broadcast the message
        websocket_util.broadcast_message(channel_name, websocket_data)

        return

    @staticmethod
    def project_created_listener(event):
        ProjectListener.broadcast(event.data['project'], event.type)
        return

    @staticmethod
    def project_updated_listener(event):
        ProjectListener.broadcast(event.data['project'], event.type)
        return

    @staticmethod
    def project_archived_listener(event):
        ProjectListener.broadcast(event.data['project'], event.type)
        return

    @staticmethod
    def project_restored_listener(event):
        ProjectListener.broadcast(event.data['project'], event.type)
        return


    def register_listeners(self):
        #PROJECTS
        project_service = ProjectService.project_events
        project_service.register('project_created', self.project_created_listener)
        project_service.register('project_updated', self.project_updated_listener)
        project_service.register('project_archived', self.project_archived_listener)
        project_service.register('project_restored', self.project_restored_listener)
