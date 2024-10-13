import json
import re
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os
from datetime import datetime

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

# Load environment variables
load_dotenv()

# Retrieve the encryption key from the .env file
encryption_key = os.getenv('ENCRYPTION_KEY').encode()
cipher_suite = None
if encryption_key:
    cipher_suite = Fernet(encryption_key)

def encrypt_text(text):
    if text is not None and cipher_suite:
        try:
            encrypted_text = cipher_suite.encrypt(text.encode('utf-8'))
            return encrypted_text.decode('utf-8')
        except Exception as e:
            return text  # Return original text if encryption fails
    return text

def decrypt_text(encrypted_text):
    if encrypted_text is not None and cipher_suite:
        try:
            decrypted_text = cipher_suite.decrypt(encrypted_text.encode('utf-8'))
            return decrypted_text.decode('utf-8')
        except Exception as e:
            pass
    return encrypted_text  # Return the input if decryption fails or cipher_suite is None

def extract_and_parse_json(text):
    """
    Extract valid JSON from a string that contains extraneous characters and parse it.

    :param text: The input text containing the JSON to extract.
    :return: The parsed JSON data.
    """

    # Remove Markdown code block syntax (triple backticks) if present
    text = re.sub(r'^```json\s*\n', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n```$', '', text, flags=re.MULTILINE)

    # Remove any unescaped newlines within the JSON structure
    text = re.sub(r'(?<!\\)\n', '', text)

    # Regex pattern to capture the JSON array.
    # It captures text between square brackets, including nested brackets.
    json_pattern = r'(\[(?:\[.*?\]|{.*?}|[^[\]{}])*?\])'

    # Use 're.DOTALL' to allow '.' to match any character including newlines.
    match = re.search(json_pattern, text, re.DOTALL)

    if match:
        json_string = match.group(1)
        try:
            # Parse the JSON string.
            json_data = json.loads(json_string)
            return json_data
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to decode JSON: {e}")
    else:
        raise ValueError("No valid JSON found in the text")


def extract_text_segment(selected_text, select_text_start, select_text_end):
    text_length = len(selected_text)

    # Ensure select_text_start is not None, is at least 0, and less than the length of the text
    start_position = max(0, min(select_text_start or 0, text_length - 1))

    # Ensure select_text_end is not None, at least 5 characters greater than start_position, and within text length
    # This also ensures select_text_end is > 0 and within the bounds of selected_text
    # If select_text_end is None, default it to the end of the text
    end_position = min(max(select_text_end or text_length, start_position + 5), text_length)

    # Adjust start_position to ensure it's at least 5 characters less than end_position
    # This is a secondary check in case select_text_end was very close to the start, violating our 5-char minimum
    start_position = min(start_position, end_position - 5)

    # Add final validation to ensure end position is at least 5 characters greater than start position
    if end_position - start_position < 5:
        raise ValueError("The selected text must be at least 5 characters long.")

    selected_text = selected_text[start_position:end_position]

    return selected_text

def replace_text_segment(full_text, start, end, replacement_text):
    """
    Replace a segment of text with the replacement text within the specified start and end positions,
    ensuring that it follows similar constraints as the extract_text_segment method.

    :param full_text: The original full text content.
    :param start: The start position of the text segment to be replaced.
    :param end: The end position of the text segment to be replaced.
    :param replacement_text: The text to insert in place of the selected segment.
    :return: The modified text with the specified segment replaced.
    """
    text_length = len(full_text)

    # Validate and adjust start and end positions similar to extract_text_segment
    start_position = max(0, min(start or 0, text_length - 1))
    end_position = min(max(end or text_length, start_position + 5), text_length)
    start_position = min(start_position, end_position - 5)

    # Add final validation to ensure end position is at least 5 characters greater than start position
    if end_position - start_position < 5:
        raise ValueError("The replacement segment must be at least 5 characters long.")

    # Replace the specified text segment
    modified_text = full_text[:start_position] + replacement_text + full_text[end_position:]
    return modified_text

def setup_opentelemetry(app):
    """
    Sets up OpenTelemetry for the given Flask app instance.
    """
    # Setup OpenTelemetry
    tracer_provider = TracerProvider(
        resource=Resource.create({SERVICE_NAME: os.getenv('SERVICE_NAME')})
    )
    trace.set_tracer_provider(tracer_provider)

    # Configure the OTLP exporter
    otlp_exporter = OTLPSpanExporter(endpoint=os.getenv('OPENTELEMETRY_ENDPOINT'), insecure=True)
    span_processor = BatchSpanProcessor(otlp_exporter)
    tracer_provider.add_span_processor(span_processor)

    # Instrument Flask app with OpenTelemetry
    FlaskInstrumentor().instrument_app(app)

def log_message(message_type, message):
    """
    Logs messages based on the LOG_DRIVER setting (file, print, or null) with OpenTelemetry support.
    Utilizes APP_PATH from environment variables for file logging.
    :param message_type: The category of the message (e.g., error, info, debug).
    :param message: The content of the message to log.
    """
    # Get the LOG_DRIVER from environment variables
    log_driver = os.getenv('LOG_DRIVER', 'file').lower()
    if log_driver not in ['file', 'print', 'null', 'false', 'none', '']:
        log_driver = 'null'  # Default to 'null' if an unexpected value is provided

    # Early return if log_driver is 'null', 'false', 'none', or empty
    if log_driver in ['null', 'false', 'none', '']:
        return

    # Get the current timestamp
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

    log_message_with_timestamp = f"[{timestamp}] {message_type.upper()}: {message}"

    # Handle file logging
    if log_driver == 'file':
        app_path = os.getenv('APP_PATH', '.')
        log_file_path = os.path.join(app_path, "logs/app.log")
        os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
        with open(log_file_path, "a") as log_file:
            log_file.write(log_message_with_timestamp + "\n")

    # Handle print logging
    elif log_driver == 'print':
        print(log_message_with_timestamp)

    # Log to OpenTelemetry server if enabled
    if os.getenv('OPENTELEMETRY_ENABLED') == 'True':
        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span("log_message"):
            trace.get_current_span().add_event(log_message_with_timestamp)
