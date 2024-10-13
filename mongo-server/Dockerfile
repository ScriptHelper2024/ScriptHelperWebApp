# Use the official MongoDB Docker image as base
FROM mongo:6.0

# Set environment variables (replace 'exampleUser' and 'examplePassword' with your desired credentials)
ENV MONGO_INITDB_ROOT_USERNAME admin
ENV MONGO_INITDB_ROOT_PASSWORD admin

# Expose port 27017
EXPOSE 27017

# Set default command to run MongoDB when a container is started from the image
CMD ["mongod"]
