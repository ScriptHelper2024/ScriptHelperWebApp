# TestWebsocketServer command

from main.libraries.Websocket import Websocket

class TestWebsocketServer:
    command_name = 'testWebsocketServer'

    def run(self, args):
        if len(args) < 1:
            print('Usage: python3 src/cmd.py testWebsocketServer <mode> <channel> [message]')
            return

        mode = args[0]
        channel = args[1]

        websocket_util = Websocket()

        if mode == "send":
            if len(args) != 3:
                print('Usage: python3 src/cmd.py testWebsocketServer send <channel> <message>')
                return
            message = args[2]
            message_data = {"data": message}
            websocket_util.broadcast_message(channel, message_data)
            print(f"Message sent to channel {channel}")

        elif mode == "listen":
            if len(args) != 2:
                print('Usage: python3 src/cmd.py testWebsocketServer listen <channel>')
                return
            websocket_util.listen_to_channel(channel)
        else:
            print("Invalid mode. Use 'send' or 'listen'.")
