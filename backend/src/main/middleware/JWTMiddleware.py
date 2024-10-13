import re
import hashlib
import json
from flask import request, g, Response
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from main.modules.User.UserModel import UserModel
from main.modules.Auth.RevokedTokenModel import RevokedTokenModel

def JWTMiddleware():
    if request.method != 'POST' or request.method == 'OPTIONS':
        return

    # Extract the operation name from the GraphQL query
    try:
        query = request.json.get('query', '').replace('\n', ' ').replace('\t', ' ')
        pattern = r'(?<=operationName:")[^"]*'
        operation_name = re.search(pattern, query)
        operation_name = operation_name.group(0) if operation_name else None
    except Exception:
        error_response = json.dumps({'error': 'Internal server error'})
        return Response(error_response, status=500, mimetype='application/json')

    # Operations list that don't mandatorily require authentication
    exceptions_list = [
        'healthCheck', 'login', 'registerUser', 'verifyEmail', 'passwordResetRequest',
        'passwordReset', 'socialLogin', 'finalizeSocialLogin', 'agentTaskById',
        'updateAgentTask', '__schema',
    ]

    # Check for authorization header
    auth_header = request.headers.get('Authorization')
    if auth_header:
        token = auth_header.split()[1]

        # Attempt authentication
        try:
            verify_jwt_in_request()

            # Check if the token has been revoked
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            if RevokedTokenModel.objects(token_hash=token_hash):
                error_response = json.dumps({'error': 'Token has been revoked'})
                return Response(error_response, status=403, mimetype='application/json')

            # Fetch user from token identity
            user_id = get_jwt_identity()
            user = UserModel.objects(id=user_id).first()
            if user:
                # Store user and auth status in global object if
                g.user = user
                g.auth_status = True

        except Exception as e:
            # If operation requires auth and fails, return error
            if operation_name not in exceptions_list:
                error_response = json.dumps({'error': f'Not authorized: {str(e)}'})
                return Response(error_response, status=403, mimetype='application/json')
            # For optional auth operations, log the error and proceed
            print(f'Optional auth failed: {str(e)}')

    # Enforce auth for operations not in the exceptions list
    if not g.get('auth_status', False) and operation_name not in exceptions_list:
        error_response = json.dumps({'error': 'Not authorized (missing or invalid token)'})
        return Response(error_response, status=403, mimetype='application/json')
