from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
import os
from libraries.utils import log_message
from dotenv import load_dotenv

load_dotenv()

class AnthropicProvider:
    def __init__(self):    
        self.api_key = os.getenv('SH_ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("No Anthropic API key found in environment variables.")
        self.anthropic = Anthropic(api_key=self.api_key)
    def send_prompt(self, system_role, user_prompt,  max_tokens=4095, temperature=0.7, model="claude-2",):
     
        prompt = f"{HUMAN_PROMPT} {system_role} {user_prompt}{AI_PROMPT}"
        try:
            
            completion = self.anthropic.completions.create(
                model=model,
                max_tokens_to_sample=max_tokens,
                prompt=prompt,
                temperature=temperature,
            )
            return completion.completion
        except Exception as e:
            log_message(f"An error occurred while sending prompt to Anthropic: {e}")
            return ""

if __name__ == '__main__':
    provider = AnthropicProvider()
    system_role = "Please complete the following story:"
    user_prompt = "In a distant future, humanity has..."
    response = provider.send_prompt(
        system_role=system_role,
        user_prompt=user_prompt,
    )
    print(response)
