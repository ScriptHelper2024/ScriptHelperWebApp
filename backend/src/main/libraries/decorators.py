import functools
from types import SimpleNamespace
from graphql import GraphQLError
from main.modules.Project.ProjectModel import ProjectModel
from main.libraries.Cache import Cache
import os
from flask import request

def admin_required(required_level=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):

            # Iterate over the args until GraphQLResolveInfo object is found
            user = None
            for arg in args:
                if hasattr(arg, 'context'):
                    user = arg.context.get('user')
                    break

            if user is None or user.admin_level < required_level:
                raise Exception('Not authorized: insufficient admin level')

            return func(*args, **kwargs)

        return wrapper
    return decorator


def agent_key_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Default to None if either the 'context' or 'headers' is missing
        context = next((arg.context for arg in args if hasattr(arg, 'context')), None)
        headers = context.get('request').headers if context else None

        # Retrieve the API Key from the headers and the environment variable
        request_api_key = headers.get('X-API-Key')
        expected_api_key = os.getenv('AGENT_SECRET_KEY')

        # Checking the API Key or Admin Level
        user = context.get('user') if context else None

        if request_api_key == expected_api_key:
            pass  # API Key is valid, proceed with the request
        elif user and user.admin_level >= 1:
            pass  # User is an admin, proceed with the request
        else:
            raise GraphQLError(f'Not authorized: invalid API Key and insufficient admin level')

        return func(*args, **kwargs)

    return wrapper


def project_role(roles=None):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract GraphQLResolveInfo object and input payload
            info = None
            input_payload = kwargs.get('input') if 'input' in kwargs else kwargs

            # Retrieve user and project_id from context and input payload
            for arg in args:
                if hasattr(arg, 'context'):
                    info = arg
                    break

            if not info:
                raise GraphQLError('GraphQLResolveInfo not found in the resolver arguments')

            user = info.context.get('user')
            if not user:
                raise GraphQLError('Authentication required')

            project_id = input_payload.get('project_id')
            if not project_id:
                raise GraphQLError('Project ID is required')

            # Load the project and check if it exists
            project = ProjectModel.objects(id=project_id).first()
            if not project:
                raise GraphQLError('Project not found')

            # Check user membership and roles within the project
            user_is_member = False
            acceptable_roles = roles.split(',') if roles else None

            for member in project.members:
                if member.user.id == user.id:
                    user_is_member = True
                    if acceptable_roles and member.role not in acceptable_roles:
                        raise GraphQLError('Insufficient permissions for the operation')
                    break

            if not user_is_member:
                raise GraphQLError('User is not a member of the project')

            return func(*args, **kwargs)

        return wrapper
    return decorator

def cache_response(cache_prefix, *identifier_keys):
    """
    Decorator to cache the response of a method based on a constructed cache key,
    with support for tagging cache entries for easy invalidation.
    Tags will include the cache prefix followed by each identifier key and its value.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract the user from the `info` context, which is assumed to be the second argument
            user = args[1].context.get('user') if len(args) > 1 and hasattr(args[1], 'context') else None
            if not user:
                #try second arg index (sometimes it is different)
                user = args[2].context.get('user') if len(args) > 1 and hasattr(args[2], 'context') else None
            user_part = f"{user.id}_" if user else ""

            # Construct the cache key with named identifier variables
            identifiers = "_".join(f"{key}:{kwargs.get(key)}" for key in identifier_keys if key in kwargs)
            cache_key = f"{cache_prefix}{user_part}{identifiers}"

            # Attempt to retrieve the cached response
            cached_response = Cache().get(cache_key)
            if cached_response:
                return cached_response

            # Define tags based on cache_prefix, user_part and individual identifier keys with their values
            tags = [cache_prefix]
            if user_part:
                tags.append(f"{cache_prefix}{user_part.strip('_')}")
            for key in identifier_keys:
                if key in kwargs:
                    # Include both the identifier key and its value in the tag
                    tags.append(f"{cache_prefix}{key}:{kwargs.get(key)}")

            # Call the original function and cache its response with tags
            response = func(*args, **kwargs)
            Cache().set(cache_key, response, tags=tags)
            return response

        return wrapper
    return decorator
