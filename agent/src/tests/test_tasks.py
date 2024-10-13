test_tasks = [
        {
            "task_id": "OPENAI-TEST-1",

            "systemRole": "system",
            "promptText": "Describe the process of photosynthesis",
            "maxInputTokens": 100,
            "maxOutputTokens": 150,
            "temperature": 0.7,
            "llmModel": "gpt-3.5-turbo"
        },
        {
            "task_id": "OPENAI-TEST-2",
            "systemRole": "user",
            "promptText": "What is the history of the internet?",
            "maxInputTokens": 120,
            "maxOutputTokens": 200,
            "temperature": 0.6,
            "llmModel": "gpt-3.5-turbo-1106"
        },
        {
            "task_id": "ANTHROPIC-TEST-1",
            "systemRole": "system",
            "promptText": "Explain quantum computing in simple terms",
            "maxInputTokens": 80,
            "maxOutputTokens": 100,
            "temperature": 0.8,
            "llmModel": "claude-2.1"
        }
    ]
