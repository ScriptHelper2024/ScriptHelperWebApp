import importlib
import os

def setup_listeners():
    # Define the path to the modules directory
    modules_path = os.path.join(os.path.dirname(__file__), 'modules')

    # Manually discover directories and Listener.py files
    for item in os.listdir(modules_path):
        module_dir_path = os.path.join(modules_path, item)
        if os.path.isdir(module_dir_path):
            # The listener file name should match the module directory name with 'Listener' appended
            listener_file = f"{item}Listener.py"
            listener_path = os.path.join(module_dir_path, listener_file)
            if os.path.isfile(listener_path):
                # Construct the module name to import, matching the case of the directory
                module_name = f"main.modules.{item}.{item}Listener"
                # Dynamically import the module
                listener_module = importlib.import_module(module_name)

                # The class name should also match the case of the directory
                listener_class_name = f"{item}Listener"
                if hasattr(listener_module, listener_class_name):
                    listener_class = getattr(listener_module, listener_class_name)

                    # Instantiate the listener class and call its register_listeners method
                    listener_instance = listener_class()
                    if hasattr(listener_instance, 'register_listeners'):
                        listener_instance.register_listeners()
