# Import the required modules from graphene
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType

class HealthCheck(ObjectType):
    """
    This is the HealthCheck GraphQL type.

    The HealthCheck type can be queried to check the status of the server.
    This is useful for monitoring and ensuring that the server is up and running.

    Fields:
    - status (String): The current status of the server. By default, it is set to "OK".
      If the server is running without any issues, the "OK" status is returned.
    """
    status = String(default_value="OK")

# This function will return the query fields and resolvers
def get_query_fields():
    return {
        'health_check': Field(HealthCheck, resolver=lambda root, info: HealthCheck())
    }

# This function will return the mutation fields if any
def get_mutation_fields():
    return {}
