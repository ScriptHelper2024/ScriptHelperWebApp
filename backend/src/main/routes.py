from flask import Blueprint
from graphql_server.flask import GraphQLView
from main.export_script import export_script as bp_export_script
from .schema import setup_schema
from .middleware.IntrospectionMiddleware import IntrospectionMiddleware
from .middleware.JWTMiddleware import JWTMiddleware
from .middleware.GraphQLJWTMiddleware import GraphQLJWTMiddleware
from .middleware.OpenTelemetryMiddleware import OpenTelemetryMiddleware

def setup_routes(app):
    """
    Sets up the routes for the given Flask application.

    Parameters:
    app (Flask): The Flask application to setup routes for.

    Returns:
    None
    """

    @app.before_request
    def before_request():
        JWTMiddleware()

    # Create the GraphQL view and make it available under the name 'graphql'
    # The 'schema' variable is passed to the view to provide the GraphQL schema
    # The 'graphiql' flag is set to True to enable the GraphiQL IDE for testing the queries
    # An empty context is provided as no additional context is required for this view
    use_middleware = [
        IntrospectionMiddleware(),
        GraphQLJWTMiddleware(),
        OpenTelemetryMiddleware(),
    ]
    schema = setup_schema()
    graphql_view = GraphQLView.as_view('graphql', schema=schema, graphiql=True, context={}, middleware=use_middleware)

    # Add the '/graphql' route to the Flask application
    # This route will handle both 'GET' and 'POST' requests
    # and forward them to the 'graphql_view' method
    app.add_url_rule('/graphql', view_func=graphql_view, methods=['GET', 'POST'])
    app.register_blueprint(bp_export_script)
