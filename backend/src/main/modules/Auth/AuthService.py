from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash
from main.modules.User.UserModel import UserModel
from .RevokedTokenModel import RevokedTokenModel
from .LoginHistoryModel import LoginHistoryModel
from .PasswordResetRequestModel import PasswordResetRequestModel
from datetime import timedelta, datetime
from flask import request
import hashlib
from main.libraries.Observable import Observable
from main.libraries.Event import Event
from random import randint
from main.libraries.Mailer import Mailer

class AuthService:
    # Initialize Observable object for auth events
    auth_events = Observable()

    @staticmethod
    def authenticate_user(email, password=None, oauth_mode=False):
        user = UserModel.objects(email=email).first()

        if not user or (not oauth_mode and not check_password_hash(user.password, password)):
            raise ValueError('Invalid credentials')

        # Ensure we have a user ID to encode in the access token
        if not user.id:
            raise ValueError('User ID not available for generating access token')

        expires = timedelta(days=30)  # Token lifespan value
        access_token = create_access_token(identity=str(user.id), expires_delta=expires)

        # Ensure that an access token was actually created
        if not access_token:
            raise ValueError('Failed to create access token')

        # Hashing the token
        token_hash = hashlib.sha256(access_token.encode()).hexdigest()

        # Getting the user IP
        user_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if user_ip.split(',')[0] == "127.0.0.1":
            user_ip = request.headers.get('X-Real-IP', user_ip)

        # Creating a new login history entry
        LoginHistoryModel(user=user, token_hash=token_hash, user_ip=user_ip).save()

        # Trigger 'user_authenticated' event and pass the user id
        AuthService.auth_events.notify(Event('user_authenticated', str(user.id)))

        return access_token


    @staticmethod
    def revoke_token(user):
        token = request.headers.get("Authorization").split()[1]
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        RevokedTokenModel(user=user, token_hash=token_hash).save()

        # Trigger 'user_logged_out' event and pass the user id
        AuthService.auth_events.notify(Event('user_logged_out', str(user.id)))

        return True

    @staticmethod
    def send_email_verification(user):
        # If the user has already verified their email, raise an exception
        if user.email_verified:
            raise ValueError("User is already verified")

        # Generate a unique 6-digit verification code
        verification_code = ''.join(["%s" % randint(0, 9) for num in range(0, 6)])

        # Check if the generated code is already used by another user
        while UserModel.objects(verification_code=verification_code).first():
            # If code already exists, generate a new one
            verification_code = ''.join(["%s" % randint(0, 9) for num in range(0, 6)])

        # Save it to the user model
        user.verification_code = verification_code
        user.save()

        #clear the cache for the user
        from main.modules.User.UserService import UserService
        UserService.clear_user_cache(user.id, user.email)

        # Send the verification email
        Mailer().send_email(
            to=user.email,
            subject="Email Verification Code",
            template="email/email_confirmation.html",
            code=verification_code,
            user=user
        )

        return True

    @staticmethod
    def verify_email(code):
        # Fetch the user with the given code
        user = UserModel.objects(verification_code = code).first()

        # If no user is found, raise an exception
        if not user:
            raise ValueError("Invalid verification code")

        # If the user has already verified their email, raise an exception
        if user.email_verified:
            raise ValueError("User has already verified their email")

        # Otherwise, mark the user as verified and set the verified_at timestamp
        user.email_verified = True
        user.verified_at = datetime.utcnow()
        user.save()

        # Trigger user_email_verified event
        AuthService.auth_events.notify(Event('user_email_verified', str(user.id)))

        #clear the cache for the user
        from main.modules.User.UserService import UserService
        UserService.clear_user_cache(user.id, user.email)

        return True


    @staticmethod
    def request_password_reset(email):
        user = UserModel.objects(email=email).first()

        if not user:
            raise ValueError("User with given email does not exist")

        # Generate a unique 12-digit reset code
        reset_code = ''.join(["%s" % randint(0, 9) for num in range(0, 12)])

        # Check if the generated code is already used
        while PasswordResetRequestModel.objects(reset_code=reset_code).first():
            # If code already exists, generate a new one
            reset_code = ''.join(["%s" % randint(0, 9) for num in range(0, 12)])

        # Expire all existing reset requests for this user
        PasswordResetRequestModel.objects(user=user, status="pending").update(set__status="expired")

        # Getting the user IP
        user_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if user_ip.split(',')[0] == "127.0.0.1":
            user_ip = request.headers.get('X-Real-IP', user_ip)

        # Creating a new password reset request entry
        PasswordResetRequestModel(user=user, reset_code=reset_code, ip_address=user_ip).save()

        # Send the password reset email
        Mailer().send_email(
            to=user.email,
            subject="Password Reset Request",
            template="email/password_reset.html",
            code=reset_code,
            user=user
        )

        return True

    @staticmethod
    def reset_password(reset_code, email, new_password):
        reset_request = PasswordResetRequestModel.objects(reset_code=reset_code, status="pending").first()

        if not reset_request:
            raise ValueError("Invalid reset code")

        if reset_request.user.email != email:
            raise ValueError("Provided email does not match with the reset code")

        if datetime.utcnow() - reset_request.timestamp > timedelta(hours=24):
            reset_request.status = "expired"
            reset_request.save()

            raise ValueError("The reset code has expired")

        # Reset user's password
        reset_request.user.password = generate_password_hash(new_password)
        reset_request.user.save()

        # Update reset request's status
        reset_request.status = "used"
        reset_request.save()

        # Trigger 'user_password_reset' event
        AuthService.auth_events.notify(Event('user_password_reset', str(reset_request.user.id)))

        #clear the cache for the user
        from main.modules.User.UserService import UserService      
        UserService.clear_user_cache(reset_request.user.id, reset_request.user.email)

        return True
