#!/bin/bash

# Start all required Docker containers: Redis, MongoDB, RabbitMQ

echo "Starting Redis container..."
./redis/docker-deploy || { echo "❌ Failed to start Redis container"; exit 1; }

echo "Starting MongoDB container..."
./mongo-server/docker-deploy || { echo "❌ Failed to start MongoDB container"; exit 1; }

echo "Starting RabbitMQ container..."
./queue-server/docker-deploy || { echo "❌ Failed to start RabbitMQ container"; exit 1; }

echo "✅ All Docker containers started successfully."
