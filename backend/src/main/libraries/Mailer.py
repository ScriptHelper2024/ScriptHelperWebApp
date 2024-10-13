from mailgun2 import Mailgun
from jinja2 import Environment, FileSystemLoader
import os
from datetime import datetime
import requests  # Import requests to handle HTTP requests directly
from main.libraries.functions import log_message

class Mailer:
    def __init__(self):
        self.driver = os.getenv("EMAIL_DRIVER", "log")

        # Get the full app path from the environment variable
        app_path = os.getenv('APP_PATH')
        # Construct the absolute path to the templates directory
        template_path = os.path.join(app_path, 'src', 'templates')

        self.template_loader = FileSystemLoader(searchpath=template_path)
        self.template_env = Environment(loader=self.template_loader)

        if self.driver == "mailgun":
            self.mailgun_domain = os.getenv("MAILGUN_DOMAIN")
            self.mailgun_secret = os.getenv("MAILGUN_SECRET")

        elif self.driver == "log":
            log_path = os.path.join(app_path, 'logs', 'mailer.log')
            self.log_file = log_path

    def send_email(self, to, subject, template, **kwargs):
        template = self.template_env.get_template(template)
        email_content = template.render(**kwargs)

        try:
            if self.driver == "mailgun":
                response = requests.post(
                    f"https://api.mailgun.net/v3/{self.mailgun_domain}/messages",
                    auth=("api", self.mailgun_secret),
                    data={"from": os.getenv("MAILGUN_FROM_EMAIL"),
                          "to": to,
                          "subject": subject,
                          "html": email_content})

                if response.status_code // 100 == 2:
                    log_message('info', f"Email successfully sent to {to}. Subject: '{subject}'")
                else:
                    error_message = response.json().get('message', 'Unknown error')
                    raise Exception(f"Failed to send email, got response code {response.status_code}: {error_message}")

            elif self.driver == "log":
                with open(self.log_file, 'a') as f:
                    f.write(f"{datetime.now()} - Email to: {to}\nSubject: {subject}\nContent:\n{email_content}\n\n")
                log_message('info', f"Email logged for {to}. Subject: '{subject}'")

            elif self.driver =="mock":
                #mock driver, just skip email
                return True
            else:
                raise ValueError(f"Unsupported email driver: {self.driver}")
        except Exception as e:
            log_message('error', f"An error occurred while sending the email: {e}")

# ... [rest of your code]
