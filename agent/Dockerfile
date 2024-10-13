# Use the official Python image based on Debian
FROM python:3.11

# Set the working directory in the container
WORKDIR /var/www/sh-agent

# Copy the requirements file into the container and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install supervisor
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*

# Copy the application source code to the container
COPY src/ /var/www/sh-agent/src/

# Copy the supervisord configuration file into the container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set the default command to execute when creating a new container
CMD ["/usr/bin/supervisord"]
