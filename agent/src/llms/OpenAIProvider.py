import os
from openai import OpenAI
from libraries.utils import log_message
from dotenv import load_dotenv

load_dotenv()

class OpenAIProvider:
    def __init__(self):
        self.api_key = os.getenv('SH_OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("No OpenAI API key found in the environment variables.")

        self.client = OpenAI(api_key=self.api_key)

    def handle_chat_completion(self, response):
        try:
            return response.choices[0].message.content if response.choices else ""
        except Exception as e:
            log_message(f"An error occurred in handling chat response: {e}")
            return ""

    def handle_instruct_completion(self, completion):
        try:
            return completion.choices[0].text.strip() if completion.choices else ""
        except Exception as e:
            log_message(f"An error occurred in handling instruct completion response: {e}")
            return ""

    def send_prompt(self, system_role, user_prompt, max_tokens, temperature, model="gpt-4", stream=False, json_mode=False):
        try:
            if "instruct" not in model and "davinci" not in model:
                response_format = {"type": "json_object"} if json_mode else None
                completion = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_role},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=temperature,
                    stream=stream,
                    response_format=response_format
                )
                return self.handle_chat_completion(completion)
            else:
                completion = self.client.completions.create(
                    model=model,
                    prompt=user_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                return self.handle_instruct_completion(completion)
        except Exception as e:
            log_message(f"An error occurred in Completion: {e}")
            return ""


if __name__ == '__main__':
    provider = OpenAIProvider()
    chat_response = provider.send_prompt(
        system_role="system",
        user_prompt="Test prompt",
        max_tokens=100,
        temperature=0.5,
        model="gpt-3.5-turbo",
    )
    instruct_response = provider.send_prompt(
        system_role="system",
        user_prompt="Test completion prompt",
        max_tokens=100,
        temperature=0.5,
        model="text-davinci-003",
    )
