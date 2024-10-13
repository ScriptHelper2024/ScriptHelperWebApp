# ScriptHelper Agent

Key component paired with the Scripthelper backend API. Watches RabbitMQ queue for new "agent tasks" submitted via the backend, processes each task in the background and then posts the results to the API. Resulting in new text generations for stories, scenes, scripts etc.

To scale up more processing of queue items, additional `sh-agent` instances can be spun up as needed. 

# Required Services

This component requires instances of the following to operate:

* RabbitMQ
* sh-backend

# Supported LLMs

Requires connecting to external LLM providers. These can be our own hosted through some sort of proxy, or other 3rd party API services like OpenAI

Current providers supported:

* OpenAI
* Anthropic

Configuration for available LLMs can be found in `src/config/llms.py`, and the logic for the provider classes can be found in `src/llms`.

# Local Setup

To set this up locally, step 1 is to install dependencies:
```
pip install -r requirements.txt
```

Step 2: Copy over `.env.example` to `.env` and update your environment variables accordingly. Set credentials to any LLM providers, point to the correct backend service host and RabbitMQ server.

Step 3: Run the agent!
```
python3 src/agent.py
```

# Docker Deployment

To run this on docker, make sure your .env and service credentials etc. are all setup, then run our script:
```
./docker-deploy
```

This will build and boot up the instance, running the `agent.py` script managed via supervisord, actively processing any queue requests that it picks up.

To directly access via bash, use:
```
./docker-access
```

Agent instances are designed to run in a fairly isolated environment - no API or outside access is exposed. They simply read & process queue items, and post back the results.
