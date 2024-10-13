"""
AgentTaskSchema

This file defines the GraphQL object types, queries, and mutations for Agent Tasks.
"""

import graphene
from graphene.types.generic import GenericScalar
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, String, DateTime, List, Int, Boolean, NonNull, InputObjectType, Float
from .AgentTaskService import AgentTaskService
from graphql import GraphQLError
from main.libraries.decorators import admin_required, cache_response, project_role, agent_key_required
from bson import ObjectId
import json
from main.libraries.PagedResult import PagedResult

# Define the AgentTask GraphQL ObjectType
class AgentTask(ObjectType):
    id = ID(required=True)
    project_id = String()
    status = String(required=True)
    status_message = String()
    llm_model = String(required=True)
    max_input_tokens = Int()
    max_output_tokens = Int()
    temperature = Float()
    prompt_text = String()
    system_role = String()
    document_type = String()
    document_id = String()
    metadata = GenericScalar()
    input_tokens_used = Int()
    output_tokens_used = Int()
    process_time = Int()
    agent_results = String()
    agent_id = String()
    errors = String()
    created_at = DateTime()
    processing_at = DateTime()
    updated_at = DateTime()

    @classmethod
    @agent_key_required
    @cache_response("agent_task_", "id")
    def resolve_agent_task_by_id(cls, root, info, id):
        # Logic to retrieve an agent task by ID
        task = AgentTaskService.load_agent_task_by_id(task_id=id)
        if not task:
            raise GraphQLError('AgentTask with the given ID not found')
        return task._to_dict()

    @classmethod
    @project_role(roles=None)
    @cache_response("agent_task_project_", "id", "project_id")
    def resolve_agent_task_by_id_for_project(cls, root, info, id, project_id):
        # Logic to retrieve an agent task by ID
        task = AgentTaskService.load_agent_task_by_id(task_id=id)
        if not task or str(task.project_id.id) != str(project_id):
            raise GraphQLError('AgentTask with the given ID not found')
        return task._to_dict(for_project=True)

    @classmethod
    @admin_required(required_level=1)
    @cache_response("agent_tasks_", "status", "document_type", "document_id", "project_id", "sort", "page", "limit")
    def resolve_list_agent_tasks(cls, root, info, **kwargs):
        # Logic to retrieve a list of agent tasks
        agent_tasks, pages, statistics = AgentTaskService.load_agent_tasks(**kwargs)

        return AgentTasksList(agent_tasks=agent_tasks, pages=pages, statistics=statistics)

    @classmethod
    @project_role(roles=None)
    @cache_response("agent_tasks_project_", "status", "document_type", "document_id", "project_id", "sort", "page", "limit")
    def resolve_list_agent_tasks_by_project(cls, root, info, **kwargs):
        # Logic to retrieve a list of agent tasks
        agent_tasks, pages, _ = AgentTaskService.load_agent_tasks(**kwargs)

        return PagedAgentTasks(agent_tasks=agent_tasks, pages=pages)

class PagedAgentTasks(PagedResult):
    agent_tasks = List(NonNull(AgentTask))

class AgentTasksStatistics(ObjectType):
    total = NonNull(Int)
    status_counts = NonNull(String)

class AgentTasksList(PagedAgentTasks):
    statistics = NonNull(AgentTasksStatistics)

# UpdateAgentTask Mutation Definition
class UpdateAgentTask(Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        status = graphene.String()
        status_message = graphene.String()
        input_tokens_used = graphene.Int()
        output_tokens_used = graphene.Int()
        process_time = graphene.Int()
        agent_results = graphene.String()
        agent_id = graphene.String()
        errors = graphene.String()

    agent_task = graphene.Field(AgentTask)

    @agent_key_required
    def mutate(self, info, id, **kwargs):
        # Call the update_agent_task service method
        task = AgentTaskService.update_agent_task(task_id=id, **kwargs)
        if task is None:
            raise GraphQLError('Unable to update AgentTask or AgentTask with the given ID not found')

        return UpdateAgentTask(agent_task=task)

class DeleteAgentTask(Mutation):
    class Arguments:
        id = ID(required=True)

    success = NonNull(Boolean)

    @admin_required(required_level=1)
    def mutate(self, info, id):
        # Logic to delete an agent task
        success = AgentTaskService.delete_agent_task(task_id=id)
        return DeleteAgentTask(success=success)

class ResetAgentTask(Mutation):
    class Arguments:
        id = ID(required=True)

    success = NonNull(Boolean)

    @admin_required(required_level=1)
    def mutate(self, info, id):
        # Logic to reset an agent task
        success = AgentTaskService.reset_agent_task(task_id=id)
        return ResetAgentTask(success=success)

def get_query_fields():
    return {
        'agent_task_by_id': Field(
            AgentTask,
            id=Argument(ID, required=True),
            resolver=AgentTask.resolve_agent_task_by_id
        ),
        'agent_task_by_id_for_project': Field(
            AgentTask,
            id=Argument(ID, required=True),
            project_id=Argument(String, required=True),
            resolver=AgentTask.resolve_agent_task_by_id_for_project
        ),
        'list_agent_tasks': Field(AgentTasksList,
            project_id=String(),
            status=String(),
            document_type=String(),
            document_id=String(),
            sort=String(),
            limit=Int(),
            page=Int(),
            resolver=AgentTask.resolve_list_agent_tasks
        ),
        'list_agent_tasks_by_project': Field(PagedAgentTasks,
            project_id=Argument(String, required=True),
            status=String(),
            document_type=String(),
            document_id=String(),
            sort=String(),
            limit=Int(),
            page=Int(),
            resolver=AgentTask.resolve_list_agent_tasks_by_project
        )
    }

def get_mutation_fields():
    return {
        'update_agent_task': UpdateAgentTask.Field(),
        'delete_agent_task': DeleteAgentTask.Field(),
        'reset_agent_task': ResetAgentTask.Field()
    }
