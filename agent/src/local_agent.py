import os
import json
from collections import deque
from dotenv import load_dotenv
from libraries.utils import log_message, prompt_llm_provider  # Import prompt_llm_provider
from tests.test_tasks import test_tasks

# Load environment variables from .env file
load_dotenv()

# Initialize a local in-memory queue
task_queue = deque()

def process_task(task_data):
    task_id = task_data.get('task_id')
    log_message(f"Received task ID: {task_id}")

    # Load task data from backend API

    if task_data:
        # Update the task status to "processing"
        print(task_id, "processing", "Processing generation request...")
        log_message(f"Processing task ID: {task_id}")

        # Process the task using LLM
        llm_response = prompt_llm_provider(task_data)

      

        # Log the LLM response
        log_message(f"LLM Response: Input tokens used {llm_response['input_tokens_used']}, Output tokens used {llm_response['output_tokens_used']}, Process time {llm_response['process_time']}ms")
        log_message(f"LLM Result: {llm_response['results']}")

        # TODO: Handle the response further if needed (e.g. store in database, send back to frontend, etc.)
    else:
        log_message(f"No data found for task ID: {task_id}")

def enqueue_task(task_data):
    task_queue.append(task_data)

def main():
    # Example of enqueuing a task
    for task in test_tasks:
            enqueue_task(task)

    while task_queue:
        task_data = task_queue.popleft()
        process_task(task_data)

if __name__ == '__main__':
    main()
