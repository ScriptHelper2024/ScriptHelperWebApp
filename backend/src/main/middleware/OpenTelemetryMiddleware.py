from graphql import OperationType, get_named_type
from opentelemetry import trace
import os

class OpenTelemetryMiddleware:
    def resolve(self, next, root, info, **args):

        if os.getenv('OPENTELEMETRY_ENABLED') != 'True':
            return next(root, info, **args)

        # Only proceed if this is a top-level field (part of the Query or Mutation types)
        if info.parent_type == info.schema.query_type or \
           info.parent_type == info.schema.mutation_type:

            tracer = trace.get_tracer(__name__)

            # Determine the operation type as a string
            operation_type_str = ""
            if info.operation.operation == OperationType.QUERY:
                operation_type_str = "query"
            elif info.operation.operation == OperationType.MUTATION:
                operation_type_str = "mutation"
            else:
                operation_type_str = "unknown"

            operation_name = info.field_name

            # Construct a span name that includes both the operation type and name
            span_name = f"{operation_type_str}: {operation_name}"

            # Start a new span for this GraphQL operation
            with tracer.start_as_current_span(span_name) as span:
                # Set attributes for further insight into the operation
                span.set_attribute("graphql.operation.type", operation_type_str)
                span.set_attribute("graphql.operation.name", operation_name)

                # Continue resolving the GraphQL request
                return next(root, info, **args)

        # If not a top-level field, just continue without logging
        return next(root, info, **args)
