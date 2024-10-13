import requests
from .utils import log_message
import os
from dotenv import load_dotenv

load_dotenv()

class BackendAPI:
    GRAPHQL_ENDPOINT = os.getenv('GRAPHQL_ENDPOINT')
    AGENT_SECRET_KEY = os.getenv('AGENT_SECRET_KEY')

    @staticmethod
    def load_agent_task(task_id):
        query = """
        query ($id: ID!) {
            agentTaskById(id: $id) {
                id
                status
                documentType
                documentId
                llmModel
                maxInputTokens
                maxOutputTokens
                temperature
                systemRole
                promptText
                metadata
            }
        }
        """
        response = requests.post(
            BackendAPI.GRAPHQL_ENDPOINT,
            json={'query': query, 'variables': {'id': task_id}},
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': BackendAPI.AGENT_SECRET_KEY
            }
        )

        if response.status_code == 200:
            log_message(f"Agent task data loaded successfully for task ID: {task_id}")
            return response.json()['data']['agentTaskById']
        else:
            log_message(f"Failed to load agent task data for task ID: {task_id}")
            return None

    @staticmethod
    def update_agent_task_status(task_id, status, status_message):
        mutation = """
        mutation ($id: ID!, $status: String!, $status_message: String!, $agent_id: String!) {
            updateAgentTask(id: $id, status: $status, statusMessage: $status_message, agentId: $agent_id) {
                agentTask {
                    id
                    status
                    statusMessage
                }
            }
        }
        """
        response = requests.post(
            BackendAPI.GRAPHQL_ENDPOINT,
            json={'query': mutation, 'variables': {
                'id': task_id,
                'status': status,
                'status_message': status_message,
                'agent_id': os.getenv('AGENT_ID')
            }},
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': BackendAPI.AGENT_SECRET_KEY
            }
        )
        log_message(f"Update status response: {response.text}")
        return response.ok

    @staticmethod
    def finalize_agent_task(task_id, input_tokens_used, output_tokens_used, process_time, results):
        mutation = """
        mutation ($id: ID!, $input_tokens_used: Int!, $output_tokens_used: Int!, $process_time: Int!, $agent_results: String!, $agent_id: String!) {
            updateAgentTask(
                id: $id,
                status: "completed",
                statusMessage: "Completed request",
                inputTokensUsed: $input_tokens_used,
                outputTokensUsed: $output_tokens_used,
                processTime: $process_time,
                agentResults: $agent_results,
                agentId: $agent_id
            ) {
                agentTask {
                    id
                    status
                    statusMessage
                }
            }
        }
        """
        response = requests.post(
            BackendAPI.GRAPHQL_ENDPOINT,
            json={'query': mutation, 'variables': {
                'id': task_id,
                'input_tokens_used': input_tokens_used,
                'output_tokens_used': output_tokens_used,
                'process_time': process_time,
                'agent_results': results,
                'agent_id': os.getenv('AGENT_ID')
            }},
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': BackendAPI.AGENT_SECRET_KEY
            }
        )
        log_message(f"Finalize task response: {response.text}")
        return response.ok
