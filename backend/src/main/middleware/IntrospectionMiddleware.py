import os

# Check if introspection is disabled via an environment variable
is_introspection_enabled = os.getenv('INTROSPECTION_ENABLED', 'False') == 'True'

class IntrospectionMiddleware(object):
    def resolve(self, next, root, info, **args):
        # Detect introspection queries by checking for the __schema and __type fields
        if not is_introspection_enabled and info.field_name in ('__schema', '__type'):
            raise Exception("Introspection queries are disabled.")

        # Call the next middleware or resolver in the chain
        return next(root, info, **args)
