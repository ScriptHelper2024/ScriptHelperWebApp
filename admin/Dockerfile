# Use a specific version of node based on Alpine for a small image size
FROM node:18-alpine

# Set the working directory for the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json ./
RUN npm cache clean --force
RUN npm install

# Copy the rest of the application source code
COPY . .

# Install supervisor and bash
RUN apk --no-cache add supervisor bash

# Copy the supervisord configuration file into the container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the port the app runs on
EXPOSE 3000

# Set the default command to execute when creating a new container
CMD ["/usr/bin/supervisord"]
