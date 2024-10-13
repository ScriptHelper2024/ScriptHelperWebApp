import os
import sys
import importlib.util
from main.config.db import initialize_db
from dotenv import load_dotenv
from main.listeners import setup_listeners
import inspect

# Load environment variables from .env file
load_dotenv()

def load_commands():
    command_dir = os.path.join(os.path.dirname(__file__), 'commands')
    command_files = [f for f in os.listdir(command_dir) if os.path.isfile(os.path.join(command_dir, f)) and f.endswith('.py')]

    commands = {}
    for file in command_files:
        #print(f'Loading command from file: {file}')  # Debug print
        module_name = os.path.splitext(file)[0]  # Get the module name by removing .py extension
        spec = importlib.util.spec_from_file_location(module_name, os.path.join(command_dir, file))
        module = importlib.util.module_from_spec(spec)

        try:
            # Execute the module and load it into memory
            spec.loader.exec_module(module)
        except Exception as e:
            print(f"Error loading module {file}: {e}")
            continue

        # Instead of inspecting the superclass, we register any class in the module
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if inspect.isclass(attr) and hasattr(attr, 'command_name'):
                try:
                    # We assume that any class in the file is a command
                    # and that it has a property called command_name and a method called run
                    commands[attr.command_name] = attr()
                    #print(f'Registering command: {attr.command_name}')  # Debug print
                except Exception as e:
                    print(f"Error registering command {attr.command_name}: {e}")

    return commands

if __name__ == '__main__':
    initialize_db()
    # Setup listeners
    setup_listeners()
    commands = load_commands()

    # Get the command from the command line arguments
    command_arg = sys.argv[1] if len(sys.argv) >= 2 else None

    if command_arg is None:
        print('No command provided')
    elif command_arg == "list":
        # If the command is "list", print out all available command names
        print('Available commands:')
        for command_name in commands:
            print(f" - {command_name}")
    elif command_arg not in commands:
        print('Command not found')
    else:
        # If a valid command is provided, execute it
        commands[command_arg].run(sys.argv[2:])
