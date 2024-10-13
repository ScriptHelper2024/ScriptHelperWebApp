import pika
import time
import importlib
from datetime import datetime
import os
from dotenv import load_dotenv
import tiktoken
from config.llms import get_model_config

load_dotenv()

def log_message(message):
    timestamp = datetime.now().isoformat()
    log_entry = f"{timestamp} - {message}\n"
    print(log_entry, end='')
    with open('logs/agent.log', 'a') as log_file:
        log_file.write(log_entry)

def connect_to_rabbitmq(queue_name):
    connection_params = pika.ConnectionParameters(host=os.getenv('RABBITMQ_HOST', 'localhost'))
    connection = pika.BlockingConnection(connection_params)
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    return connection, channel

def start_rabbitmq_consumer(channel, callback, queue_name):
    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=False)
    try:
        log_message("Starting RabbitMQ consumer...")
        channel.start_consuming()
    except KeyboardInterrupt:
        log_message("RabbitMQ consumer stopped manually.")
    except Exception as e:
        log_message(f"Error: {e}")
        time.sleep(5)  # Sleep before restarting consumer
        start_rabbitmq_consumer(channel, callback, queue_name)

def count_tokens(string: str, encoding_name: str = "gpt2") -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

def prompt_llm_provider(task):
    start_time = time.time()

    # Extract task details
    system_role = task["systemRole"]
    prompt_text = task["promptText"]
    max_input_tokens = task.get("maxInputTokens", None)
    max_output_tokens = task.get("maxOutputTokens", None)
    temperature = task["temperature"]
    llm_model = task["llmModel"]

    # Load model configuration based on the llm_model
    model_config = get_model_config(llm_model)
    provider_class_name = model_config['provider']
    model_config = model_config['config']

    # Override max input/output tokens if necessary
    max_input_tokens = min(max_input_tokens, model_config['max_input_tokens']) if max_input_tokens else model_config['max_input_tokens']
    max_output_tokens = min(max_output_tokens, model_config['max_output_tokens']) if max_output_tokens else model_config['max_output_tokens']

    # Count input tokens
    system_role_tokens = count_tokens(system_role)
    prompt_text_tokens = count_tokens(prompt_text)
    total_input_tokens = system_role_tokens + prompt_text_tokens

    # Truncate prompt_text if the total tokens exceed max_input_tokens
    if total_input_tokens > max_input_tokens:
        # Calculate how many tokens we can use for prompt_text
        available_tokens_for_prompt = max_input_tokens - system_role_tokens
        # Truncate prompt_text to fit the available token count
        truncated_prompt_text, tokens_truncated = truncate_text_to_tokens(prompt_text, available_tokens_for_prompt)
        log_message(f"Input too big ({total_input_tokens}), truncated {tokens_truncated} tokens")
        input_tokens_used = max_input_tokens
    else:
        truncated_prompt_text = prompt_text
        input_tokens_used = total_input_tokens

    # Import the provider class dynamically
    provider_module = importlib.import_module(f"llms.{provider_class_name}")
    ProviderClass = getattr(provider_module, provider_class_name)

    # Instantiate the provider
    provider = ProviderClass()

    # Send the prompt to the provider
    results = provider.send_prompt(system_role, truncated_prompt_text, max_output_tokens, temperature, llm_model)

    # Count the tokens of the output result
    output_tokens_used = count_tokens(results)

    # Calculate the processing time in milliseconds
    process_time = int((time.time() - start_time) * 1000)

    return {
        'input_tokens_used': input_tokens_used,
        'output_tokens_used': output_tokens_used,
        'process_time': process_time,
        'results': results
    }

def truncate_text_to_tokens(text, max_tokens, encoding_name="gpt2"):
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(text)
    if len(tokens) > max_tokens:
        truncated_tokens = tokens[:max_tokens]
        truncated_text = encoding.decode(truncated_tokens)
        return truncated_text, len(tokens) - max_tokens
    return text, 0
