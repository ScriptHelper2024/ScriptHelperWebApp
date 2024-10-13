import sys
from main.libraries.Mailer import Mailer

class TestMailer:
    command_name = 'testMailer'

    def run(self, args):
        # Check for at least one argument (recipient email)
        if len(args) < 1:
            print('Usage: python3 src/cmd.py testMailer recipient@example.com [subject] [message]')
            return

        # Extract the recipient email
        recipient_email = args[0]

        # Default subject and message if not provided
        default_subject = "Test Email"
        default_message = "This is a test message from the mail system."

        # Use provided subject and message if supplied, otherwise use defaults
        subject = args[1] if len(args) > 1 else default_subject
        message = args[2] if len(args) > 2 else default_message

        # Initialize the Mailer
        mailer = Mailer()

        # Send the test email using the Mailer class
        try:
            mailer.send_email(
                to=recipient_email,
                subject=subject,
                template='email/test_email.html',  # Assuming there's a template at this path
                body=message
            )
            print(f"Test email sent to {recipient_email}. Subject: '{subject}'")
        except Exception as e:
            print(f"An error occurred while sending email: {e}")
