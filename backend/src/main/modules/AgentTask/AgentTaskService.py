import os
from datetime import datetime
from .AgentTaskModel import AgentTaskModel
from main.libraries.QueueHelper import QueueHelper
from main.libraries.Event import Event
from main.libraries.Observable import Observable
from mongoengine.queryset.visitor import Q
from mongoengine.queryset import QuerySet
from .AgentTaskModel import agent_task_status_choices
import json
from main.config.settings import settings
from main.libraries.Cache import Cache
from main.libraries.functions import decrypt_text, log_message


class AgentTaskService:

    # Create an observable instance for the service
    task_events = Observable()

    @staticmethod
    def new_agent_task(project_id, document_type, document_id, llm_model, max_input_tokens,
                       max_output_tokens, temperature, prompt_text, system_role, metadata=None):
        """Register a new AgentTaskModel object with a status of 'pending'"""
        try:
            task = AgentTaskModel(
                project_id=project_id,
                status='pending',
                document_type=document_type,
                document_id=document_id,
                llm_model=llm_model,
                max_input_tokens=max_input_tokens,
                max_output_tokens=max_output_tokens,
                temperature=temperature,
                prompt_text=prompt_text,
                system_role=system_role,
                metadata=metadata or {}
            )
            task.save()

            #refresh data
            task = AgentTaskModel.objects(id=task.id).first()

            # Push the task ID to the RabbitMQ server
            QueueHelper.publish_task(task.id, 'agent_task_queue')
            log_message('info', f'Sent task ID {task.id} to queue server')

            #trigger additional event listeners
            AgentTaskService.task_events.notify(Event('agent_task_created', {'task': task}))
            AgentTaskService.clear_agent_task_cache(task.id)

            log_message('info', f'Created new agent task with ID: {task.id}')

            # Return the created task object
            return task
        except Exception as e:
            log_message('error', f'Error creating agent task: {e}')
            return None

    @staticmethod
    def new_agent_task_with_prompt(project_id, document_type, document_id, prompt_data, metadata=None):
        return AgentTaskService.new_agent_task(
            project_id = project_id,
            document_type = document_type,
            document_id = str(document_id),
            llm_model = prompt_data['model'],
            max_input_tokens = prompt_data['max_input_tokens'],
            max_output_tokens = prompt_data['max_output_tokens'],
            temperature = prompt_data['temperature'],
            prompt_text = prompt_data['prompt_text'],
            system_role = prompt_data['system_role'],
            metadata = metadata)

    @staticmethod
    def load_agent_task_by_id(task_id):
        """Loads an agent task by ID"""
        try:
            task = AgentTaskModel.objects.get(id=task_id)
            return task
        except AgentTaskModel.DoesNotExist:
            return None

    @staticmethod
    def load_agent_tasks(status=None, document_type=None, document_id=None, project_id=None, sort='desc', page=1, limit=None):
        """
        Loads a list of agent tasks with optional status, document_type, document_id, and project_id filters,
        and with sorting parameters ('asc' or 'desc'), and limit/offset pagination.
        """
        if not limit:
            limit = settings.record_limit

        tasks = AgentTaskModel.objects()

        statistics = AgentTaskService.get_agent_tasks_statistics(tasks)

        # Build the base query using Q objects for optional filtering
        query = Q()
        if project_id:
            query &= Q(project_id=project_id)
        if status:
            query &= Q(status=status)
        if document_type:
            query &= Q(document_type__contains=document_type)
        if document_id:
            query &= Q(document_id__contains=document_id)

        # Determine sort order
        sort_order = "id" if sort == 'asc' else "-id"

        # Query the database with filters, sort order, and pagination
        tasks = tasks.filter(query).only(
            'id', 'status', 'status_message', 'document_type', 'document_id', 'llm_model', 'project_id', 'process_time', 'input_tokens_used', 'output_tokens_used', 'created_at', 'updated_at'
        ).order_by(sort_order)

        # caclulate the number of pages based on total number of records
        pages = (len(tasks) + limit -1) // limit

        # limit the results
        tasks = tasks.skip((page - 1) * limit).limit(limit)

        # Convert the queryset to a list of task dictionaries, including the project_id
        task_list = [{
            'id': str(task.id),
            'status': task.status,
            'status_message': task.status_message,
            'document_type': task.document_type,
            'document_id': task.document_id,
            'llm_model': task.llm_model,
            'project_id': str(task.project_id.id) if task.project_id else None,
            'process_time': task.process_time,
            'input_tokens_used': task.input_tokens_used,
            'output_tokens_used': task.output_tokens_used,
            'created_at': task.created_at,
            'updated_at': task.updated_at
        } for task in tasks]

        return task_list, pages, statistics

    @staticmethod
    def get_agent_tasks_statistics(agent_tasks: QuerySet):

        statistics = {}
        statistics['total'] = agent_tasks.count()

        status_counts = {}
        for choice in agent_task_status_choices:
            status_counts[choice] = agent_tasks.filter(Q(status=choice)).count()

        statistics['status_counts'] = json.dumps(status_counts)

        return statistics


    @staticmethod
    def update_agent_task(task_id, status=None, status_message=None, input_tokens_used=None,
                          output_tokens_used=None, process_time=None, agent_results=None,
                          agent_id=None, errors=None):
        """
        Updates fields of an agent task for the given ID.
        """
        task = AgentTaskModel.objects(id=task_id).first()

        if not task:
            return None  # Or raise an exception if you prefer

        # Update fields if provided
        if status is not None:
            if task.status != 'processing' and status == 'processing':
                task.processing_at = datetime.utcnow()
            task.status = status
        if status_message is not None:
            task.status_message = status_message
        if input_tokens_used is not None:
            task.input_tokens_used = input_tokens_used
        if output_tokens_used is not None:
            task.output_tokens_used = output_tokens_used
        if process_time is not None:
            task.process_time = process_time
        if agent_results is not None:
            task.agent_results = agent_results
        if agent_id is not None:
            task.agent_id = agent_id
        if errors is not None:
            task.errors = errors

        task.updated_at = datetime.utcnow()  # Always update the 'updated_at' field
        task.save()  # Save the changes to the database

        #refresh data
        task = AgentTaskModel.objects(id=task.id).first()

        #trigger additional event listeners
        AgentTaskService.task_events.notify(Event('agent_task_updated', {'task': task}))
        AgentTaskService.clear_agent_task_cache(task.id)

        log_message_text = f"Agent task with ID {task_id} updated successfully."
        log_message('info', log_message_text)

        #need to decrypto text again for output...for some reason this doesnt work otherwise
        task.agent_results = decrypt_text(task.agent_results)

        return task

    @staticmethod
    def delete_agent_task(task_id):
        """Deletes an agent task for the given ID."""
        task = AgentTaskModel.objects(id=task_id).first()
        if task:
            task.delete()

            #trigger additional event listeners
            AgentTaskService.task_events.notify(Event('agent_task_deleted', {'task_id': task_id}))

            log_message_text = f"Agent task with ID {task_id} deleted successfully."
            log_message('info', log_message_text)
            AgentTaskService.clear_agent_task_cache(task_id)

            return True
        else:
            log_message_text = f"Agent task with ID {task_id} not found for deletion."
            log_message('error', log_message_text)
            raise ValueError('AgentTask not found ' + task_id)

    @staticmethod
    def reset_agent_task(task_id):
        """
        Resets the fields of an agent task and sets its status to 'pending'.
        """
        try:
            # Attempt to retrieve the task by the given ID
            task = AgentTaskModel.objects(id=task_id).first()

            if not task:
                raise ValueError('AgentTask not found: ' + task_id)

            # Reset the specified fields
            task.status_message = None
            task.input_tokens_used = None
            task.output_tokens_used = None
            task.process_time = None
            task.agent_results = None
            task.agent_id = None
            task.errors = None
            task.processing_at = None

            # Set the status to 'pending'
            task.status = 'pending'
            task.updated_at = datetime.utcnow()

            # Save the changes to the database
            task.save()

            # code is causing exception
            # Push the task ID back to the message queue
            QueueHelper.publish_task(task.id, 'agent_task_queue')

            #trigger additional event listeners
            AgentTaskService.task_events.notify(Event('agent_task_reset', {'task': task}))

            log_message_text = f"Agent task with ID {task_id} has been reset and re-queued."
            log_message('info', log_message_text)
            AgentTaskService.clear_agent_task_cache(task.id)

            return True
        except Exception as e:
            # Log the error or handle it as you see fit
            log_message_text = f'Agent task reset error: {e}'
            log_message('error', log_message_text)
            raise ValueError(f'Agent task reset error: {e}')

    @staticmethod
    def clear_agent_task_cache(agent_task_id):
        # Construct tags for invalidation
        tags_to_clear = []
        tags_to_clear.append('agent_tasks_')
        tags_to_clear.append('agent_tasks_project_')
        tags_to_clear.append(f'agent_task_id:{agent_task_id}')
        tags_to_clear.append(f'agent_task_project_id:{agent_task_id}')

        # Utilize the clear_by_tags method to clear cache entries associated with the identified tags
        Cache().forget_by_tags(tags_to_clear)
