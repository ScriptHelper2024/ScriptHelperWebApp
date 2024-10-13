# Define the configuration for LLM providers and their models
LLMS_CONFIG = {
    'openai': {
        'provider_class_name': 'OpenAIProvider',
        'models': {
            'gpt-3.5-turbo': {'max_input_tokens': 2048, 'max_output_tokens': 2048},
            'gpt-3.5-turbo-16k-0613': {'max_input_tokens': 2048, 'max_output_tokens': 2048},
            'gpt-4': {'max_input_tokens': 4096, 'max_output_tokens': 4096},
            'gpt-4-0613': {'max_input_tokens': 4096, 'max_output_tokens': 4096},
            'gpt-4-turbo-preview': {'max_input_tokens': 123904, 'max_output_tokens': 4096},
            'gpt-4o': {'max_input_tokens': 123904, 'max_output_tokens': 4096},            
            'gpt-3.5-instruct': {'max_input_tokens': 4096, 'max_output_tokens': 4096},
            "gpt-3.5-turbo-0125": {'max_input_tokens': 12288, 'max_output_tokens': 4096},
        }
    },


    'anthropic': {
        'provider_class_name': 'AnthropicProvider',
        'models': {
            'claude-2': {'max_input_tokens': 95904, 'max_output_tokens': 4096},
            'claude-2.1': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
            'claude-3-opus': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
            'claude-3-sonnet': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
            'claude-3-haiku': {'max_input_tokens': 195906, 'max_output_tokens': 4096},
            'claude-3-5-sonnet-20240620': {'max_input_tokens': 195906, 'max_output_tokens': 8192},
        }
    }
}
    # Define configurations for other providers as needed

def get_model_config(model_name):
    for provider, config in LLMS_CONFIG.items():
        if model_name in config['models']:
            return {
                'provider': config['provider_class_name'],
                'config': config['models'][model_name],
            }
    raise ValueError(f"No configuration found for model: '{model_name}'")
