# Use the official RabbitMQ image from Docker Hub
FROM rabbitmq:3-management

# Set the hostname
ENV RABBITMQ_NODENAME=shMQ

# Expose the ports used by RabbitMQ
EXPOSE 5672 15672

# Define environment variables.
ENV RABBITMQ_USERNAME=admin
ENV RABBITMQ_PASSWORD=admin

# Define default command
CMD ["rabbitmq-server"]
