import os
import pika
import json

class QueueHelper:
    @staticmethod
    def publish_task(task_id, queue_name):
        """ Publish a new task ID to the RabbitMQ server"""

        if os.getenv('MOCK_QUEUE') == '1':
            return

        # Load the RabbitMQ connection parameters from environment variables
        rabbitmq_host = os.environ.get('RABBITMQ_HOST')
        rabbitmq_user = os.environ.get('RABBITMQ_USER')
        rabbitmq_pass = os.environ.get('RABBITMQ_PASS')

        # Set up RabbitMQ connection and channel
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
        channel = connection.channel()

        # Declare the queue
        channel.queue_declare(queue=queue_name, durable=True)

        # Publish the message
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps({'task_id': str(task_id)}),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Make message persistent
            )
        )

        # Close the connection
        connection.close()
