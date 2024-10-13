import json
import graphene
from main.schema import setup_schema, get_module_field_mapping
from graphql.type.scalars import GraphQLScalarType

class ListSchema:
    command_name = 'listSchema'

    def run(self, args):
        schema = setup_schema()

        if '--export' in args:
            self.export_schema(schema)
        else:
            self.list_schema()

    def list_schema(self):
        module_field_mapping = get_module_field_mapping()

        print("Available GraphQL Schema by Module:\n")

        for module_name in sorted(module_field_mapping['queries'].keys()):
            print(f"Module: {module_name}")
            query_names = module_field_mapping['queries'].get(module_name, [])
            mutation_names = module_field_mapping['mutations'].get(module_name, [])

            # Print queries in camelCase
            for query_name in sorted(query_names):
                camel_case_query_name = self.to_camel_case(query_name)
                print(f"  Query: {camel_case_query_name}")

            # Print mutations in camelCase
            for mutation_name in sorted(mutation_names):
                camel_case_mutation_name = self.to_camel_case(mutation_name)
                print(f"  Mutation: {camel_case_mutation_name}")

            # Add a newline for better separation between modules
            print()

    def to_camel_case(self, snake_str):
        components = snake_str.split('_')
        return components[0] + ''.join(x.title() for x in components[1:])

    def export_schema(self, schema):
        exported_data = self.process_schema(schema)
        with open('predefinedQueries.json', 'w') as outfile:
            json.dump(exported_data, outfile, indent=2)
        print("Exported GraphQL schema to predefinedQueries.json")

    # Updated process_schema to group by module
    def process_schema(self, schema):
        module_field_mapping = get_module_field_mapping()
        processed_data = {}

        for module, queries in module_field_mapping['queries'].items():
            for query_name in queries:
                query = getattr(schema.query, query_name)
                field_data = self.extract_field_data(query, query_name, module, "query")
                processed_data.update(field_data)

        for module, mutations in module_field_mapping['mutations'].items():
            for mutation_name in mutations:
                mutation = getattr(schema.mutation, mutation_name)
                field_data = self.extract_field_data(mutation, mutation_name, module, "mutation")
                processed_data.update(field_data)

        return processed_data

    def extract_field_data(self, field, field_name, module, operation_type):
        args = self.get_arguments(field.args)
        return_type = self.get_return_type(field)
        # Create the nested structure as per the new requirement
        return {
            self.to_camel_case(field_name): {
                "type": operation_type,
                "fields": {
                    self.to_camel_case(field_name): {
                        "args": args,
                        "returns": return_type
                    }
                }
            }
        }


    def get_arguments(self, args):
        # If 'args' is a dictionary, process normally
        if isinstance(args, dict):
            return {self.to_camel_case(arg_name): self.get_type_str(arg.type) for arg_name, arg in args.items()}

        # If 'args' is a tuple, it may be a list of Argument objects without names
        elif isinstance(args, tuple):
            return {self.to_camel_case(arg.name): self.get_type_str(arg.type) for arg in args}

        # Otherwise, raise an error because 'args' is not a recognized type
        else:
            raise TypeError(f"Expected args to be a dict or tuple, got {type(args).__name__}")

    def get_type_str(self, gql_type):
        if isinstance(gql_type, graphene.NonNull):
            gql_type = gql_type.of_type
        if isinstance(gql_type, graphene.List):
            return [self.get_type_str(gql_type.of_type)]
        if hasattr(gql_type, '_meta'):
            return gql_type._meta.name
        return type(gql_type).__name__

    def get_return_type(self, gql_type):
        # Check if it's a NonNull or List type, and unwrap it to get to the inner type
        if isinstance(gql_type, (graphene.NonNull, graphene.List)):
            return self.get_return_type(gql_type.of_type)

        # If it's a graphene ObjectType, return a list of its fields' names
        if hasattr(gql_type, '_meta') and hasattr(gql_type._meta, 'fields'):
            # Only include field names, no types or placeholder values
            return [self.to_camel_case(field_name) for field_name in gql_type._meta.fields.keys()]

        # If it's a graphene Field, get the return type from its type attribute
        if isinstance(gql_type, graphene.Field):
            return self.get_return_type(gql_type.type)

        # If it's a graphene Scalar or an Enum, return its name
        if isinstance(gql_type, (graphene.Scalar, graphene.Enum)):
            return gql_type._meta.name

        # For other cases (InputObjectType, Mutation, etc.), return the class name
        return gql_type.__class__.__name__
