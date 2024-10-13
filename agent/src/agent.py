import os
import json
from dotenv import load_dotenv
from libraries.utils import log_message, connect_to_rabbitmq, start_rabbitmq_consumer, prompt_llm_provider  # Import prompt_llm_provider
from libraries.backend import BackendAPI

# Load environment variables from .env file
load_dotenv()

# Setup connection parameters from environment variables
QUEUE_NAME = os.getenv('QUEUE_NAME')

def callback(ch, method, properties, body):
    task_data = json.loads(body)
    task_id = task_data.get('task_id')
    log_message(f"Received task ID: {task_id}")

    # Load task data from backend API
    agent_task = BackendAPI.load_agent_task(task_id)

    if agent_task:
        # Update the task status to "processing"
        BackendAPI.update_agent_task_status(task_id, "processing", "Processing generation request...")
        log_message(f"Processing task ID: {task_id}")

        # Process the task using LLM
        llm_response = prompt_llm_provider(agent_task)

        # Update the task with the results of the processing
        BackendAPI.finalize_agent_task(
            task_id,
            input_tokens_used=llm_response['input_tokens_used'],
            output_tokens_used=llm_response['output_tokens_used'],
            process_time=llm_response['process_time'],
            results=llm_response['results']
        )

        # Log the LLM response
        log_message(f"LLM Response: Input tokens used {llm_response['input_tokens_used']}, Output tokens used {llm_response['output_tokens_used']}, Process time {llm_response['process_time']}ms")
        #log_message(f"LLM Result: {llm_response['results']}")

        # TODO: Handle the response further if needed (e.g. store in database, send back to frontend, etc.)
    else:
        log_message(f"No data found for task ID: {task_id}")

    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    connection, channel = connect_to_rabbitmq(QUEUE_NAME)
    start_rabbitmq_consumer(channel, callback, QUEUE_NAME)
    # It's important to close the connection inside a try-finally block or after the start_rabbitmq_consumer loop to ensure it's always closed properly
    try:
        start_rabbitmq_consumer(channel, callback, QUEUE_NAME)
    finally:
        connection.close()

if __name__ == '__main__':
    main()
