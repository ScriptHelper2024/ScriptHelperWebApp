import os
import importlib
from graphene import Schema, ObjectType
from main.libraries.functions import log_message

# Global dictionary to store the module names for queries and mutations
module_field_mapping = {
    'queries': {},
    'mutations': {}
}

# Function to create a new ObjectType with dynamically added fields
def create_dynamic_type(class_name, fields_dict):
    return type(class_name, (ObjectType,), fields_dict)

def setup_schema():
    modules_path = os.path.join(os.path.dirname(__file__), 'modules')

    # Temporary dictionaries to keep fields before creating the dynamic ObjectType
    temp_query_fields = {}
    temp_mutation_fields = {}

    # Clear previous module-field mapping
    module_field_mapping['queries'].clear()
    module_field_mapping['mutations'].clear()

    # Iterate over each module and load their schema
    for item in os.listdir(modules_path):
        module_dir_path = os.path.join(modules_path, item)
        if os.path.isdir(module_dir_path):
            schema_file_path = os.path.join(module_dir_path, f"{item}Schema.py")
            # Check if the expected schema file exists before attempting to load
            if os.path.exists(schema_file_path):
                try:
                    schema_module = importlib.import_module(f".{item}.{item}Schema", 'main.modules')

                    # Load query and mutation fields from the module
                    module_query_fields = schema_module.get_query_fields()
                    module_mutation_fields = schema_module.get_mutation_fields()

                    # Update the temporary field dictionaries
                    temp_query_fields.update(module_query_fields)
                    temp_mutation_fields.update(module_mutation_fields)

                    # Update the global module-field mapping
                    module_field_mapping['queries'][item] = list(module_query_fields.keys())
                    module_field_mapping['mutations'][item] = list(module_mutation_fields.keys())

                except (ImportError, AttributeError) as e:
                    # Handle errors in loading schema
                    log_message('error', f"Error loading schema for {item}: {e}")

    # Dynamically create the Query and Mutations ObjectType classes with all collected fields
    Query = create_dynamic_type('Query', temp_query_fields)
    Mutations = create_dynamic_type('Mutations', temp_mutation_fields)

    # Create the schema with the dynamically constructed Query and Mutations
    return Schema(query=Query, mutation=Mutations if temp_mutation_fields else None)

# Expose the module-field mapping for other modules to use, such as the listSchema command
def get_module_field_mapping():
    return module_field_mapping
