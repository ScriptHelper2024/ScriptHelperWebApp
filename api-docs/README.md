# Scripthelper GraphQL API Docs

Generated API documentation for the Scripthelper backend API.

To update with the latest, use the following while local backend API server is running:
```
./generate-docs.sh
```

Then add and commit the `public` folder. Don't forget to add in the latest `predefinedQueries.json` and `functionsByModule.txt` files which can be generated from the 
```python3 src/listSchema --export```
and
```python3 src/listSchema > functionsByModule.txt```
commands from the backend. Copy/paste into the public folder.

# Docker Deployment

To deploy with Docker, just run:
```
./docker-deploy
```

Make sure to set the .env values appropriately. Meant to run on a subdomain as a virtual host along with `nginx-proxy` instance.
Runs on port 4999 by default.
