# Use the official Python image based on Debian
FROM python:3.11

# Set the working directory in the container
WORKDIR /var/www/sh-backend

# Copy the requirements file into the container and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install supervisor
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*

# Copy the application source code to the container
COPY src/ /var/www/sh-backend/src/

# Copy the ssl directory (containing the setup-ssl.sh script and possibly the certificate files)
COPY ssl /var/www/sh-backend/ssl

# Run the setup SSL script from within the ssl directory
RUN /var/www/sh-backend/ssl/setup-ssl.sh

# Copy the supervisord configuration file into the container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports the app runs on
EXPOSE 5000
EXPOSE 2052
EXPOSE 2053

# Set the default command to execute when creating a new container
CMD ["/usr/bin/supervisord"]
