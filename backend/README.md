# ScriptHelper Backend

The backend GraphQL API service for ScriptHelper. Built in Python with Flask.

# Required Services

You will need instances of the following services active (recommended via Docker) in order to run the backend:

* MongoDB
* Redis
* RabbitMQ

In order to use OpenTelemetry, you will need:

* SigNoz - or other OPTM backend

For processing queue items to generate AI content, you need an instance of `sh-agent` running connected to the queue and with proper configuration pointing to the backend API, and any LLM providers.

Other 3rd party services:

* Mailgun for email
* Google OAuth2 configuration for social login

# Local Setup

On your linux machine:

Step 1: Install dependencies
```
pip install -r requirements.txt
```

Step 2: Copy `.env.example` to `.env`, open in a text editor and set values / service credentials accordingly

Step 3: Use `python3 src/cmd.py generateKey` to generate a value for `ENCRYPTION_KEY`, and you can also run this again for `JWT_SECRET_KEY`

Step 4: Run the database seeder to load in initial values, prompt templates, generate admin account etc.
```
python3 src/cmd.py seedDatabase
```

Step 5: Run the server!
```
python3 src/run.py
```

You should now be able to make API requests and interact with the system.
Note: Using run.py directly is for development purposes only. For production you will want via docker/supervisor/gunicorn (see supervisord.conf file)

For unit tests:
```
src/unittest.sh
```

# Docker deployment
You can use docker-compose, or the recommended way is to use our deployment script:
```
./docker-deploy
```

Assuming .env is setup and all services connected, that's all you need to do. You can run it again to rebuild, stop the current instance and start back up.

If you want to access the instance directly via bash, you can use this script to get into the terminal:
```
./docker-access
```

One thing to note for production is that an SSL certificate / key should be created and stored inside of the `ssl` folder. When deploying, this will be configured on the docker instance to enable secure websockets -- required to use the websockets system over HTTPS.

By default, both the development server and the docker deployment will run on port 5000. This is meant to be used in combination with the `nginx-proxy` instance (see repo), which runs on port 80 and then routes traffic to the correct internal port based on the `VIRTUAL_HOST` env var. Websockets will run on port 2053 by default (depending on `WEBSOCKET_SERVER_PORT` env var).

# Other Notes

* There are a number of commands/scripts available, you can use `python3 src/cmd.py list` to get a list of them, or browse the `src/commands` to find the class files.
* Admin accounts must be explicitly set via server command. Use `python3 src/cmd.py setAdmin <email>` after registering an account.
* Logs are in `logs/app.log`
* Check out the `src/unittest.sh` script to discover some extra `.env` vars you can optionally set in your dev environment to enable/disable certain things, like caching etc.
