# Use the Nginx image from Docker Hub
FROM nginx:alpine

# Install bash
RUN apk add --no-cache bash

# Set the working directory in the container
WORKDIR /usr/share/nginx/html

# Remove any existing files in the Nginx default directory
RUN rm -rf ./*

# Copy the 'public' directory from your project into the default Nginx serve directory
COPY public/ .

# Expose port to the outside world
EXPOSE 4999

# Start Nginx and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]
