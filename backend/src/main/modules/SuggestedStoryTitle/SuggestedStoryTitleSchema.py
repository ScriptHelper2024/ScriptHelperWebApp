# SuggestedStoryTitleSchema.py
from graphene import ObjectType, Mutation, String, Schema, Field, Argument, ID, List, Boolean, NonNull, DateTime
from graphql import GraphQLError
from datetime import datetime
from main.libraries.decorators import project_role, cache_response
from .SuggestedStoryTitleService import SuggestedStoryTitleService

# Define the SuggestedStoryTitle ObjectType
class SuggestedStoryTitle(ObjectType):
    id = ID(required=True)
    project_id = ID(required=True)
    title = String(required=True)
    created_at = DateTime()
    created_by = ID()

    @classmethod
    @project_role(roles=None)
    @cache_response('title_suggestions_', 'project_id')
    def resolve_list_title_suggestions(cls, info, project_id):
        try:
            suggestions = SuggestedStoryTitleService.list_suggestions_for_project(project_id)
            return [suggestion._to_dict() for suggestion in suggestions]
        except Exception as e:
            raise GraphQLError('Failed to list suggestions.')

    @classmethod
    @project_role(roles=None)
    @cache_response('title_suggestion_', 'project_id', 'suggestion_id')
    def resolve_get_title_suggestion_by_id(cls, info, project_id, suggestion_id):
        try:
            suggestion = SuggestedStoryTitleService.get_suggestion_by_id(suggestion_id, project_id)
            if suggestion is None:
                raise GraphQLError(f'Suggestion with ID {suggestion_id} not found.')
            return suggestion._to_dict()
        except GraphQLError as e:
            # Re-raise the GraphQLError without logging as it's a user-facing error message
            raise e
        except Exception as e:
            raise GraphQLError(f'An error occurred while retrieving the suggestion: {str(e)}')

# Mutations
class CreateSuggestion(Mutation):
    class Arguments:
        project_id = ID(required=True)
        title = String(required=True)

    success = Boolean()
    suggestion = Field(SuggestedStoryTitle)

    @project_role(roles="owner")
    def mutate(self, info, project_id, title):
        user = info.context.get('user')
        suggestion = SuggestedStoryTitleService.create_suggestion(project_id, user, title)
        return CreateSuggestion(success=True, suggestion=suggestion)

class DeleteSuggestion(Mutation):
    class Arguments:
        project_id = ID(required=True)
        suggestion_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, suggestion_id):
        success = SuggestedStoryTitleService.delete_suggestion(suggestion_id, project_id)
        return DeleteSuggestion(success=success)

class DeleteAllSuggestions(Mutation):
    class Arguments:
        project_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id):
        deleted_count = SuggestedStoryTitleService.delete_all_suggestions(project_id)
        success = deleted_count > 0
        return DeleteAllSuggestions(success=success)

class ApplySuggestion(Mutation):
    class Arguments:
        project_id = ID(required=True)
        suggestion_id = ID(required=True)

    success = Boolean()

    @project_role(roles="owner")
    def mutate(self, info, project_id, suggestion_id):
        success = SuggestedStoryTitleService.apply_suggestion(project_id, suggestion_id)
        return ApplySuggestion(success=success)

class GenerateSuggestion(Mutation):
    class Arguments:
        project_id = ID(required=True)
        story_text_id = ID()

    agent_task_id = ID()

    @project_role(roles="owner")
    def mutate(self, info, project_id, story_text_id=None):
        user = info.context.get('user')
        agent_task_id = SuggestedStoryTitleService.generate_suggestion(project_id, user, story_text_id)
        return GenerateSuggestion(agent_task_id=agent_task_id)


def get_query_fields():
    return {
        'list_title_suggestions': List(SuggestedStoryTitle,
            project_id=ID(required=True),
            resolver=lambda self, info, **args: SuggestedStoryTitle.resolve_list_title_suggestions(info, **args)
        ),
        'get_title_suggestion_by_id': Field(SuggestedStoryTitle,
            project_id=ID(required=True),
            suggestion_id=ID(required=True),
            resolver=lambda self, info, **args: SuggestedStoryTitle.resolve_get_title_suggestion_by_id(info, **args)
        )
    }

def get_mutation_fields():
    return {
        'create_title_suggestion': CreateSuggestion.Field(),
        'delete_title_suggestion': DeleteSuggestion.Field(),
        'delete_all_title_suggestions': DeleteAllSuggestions.Field(),
        'apply_title_suggestion': ApplySuggestion.Field(),
        'generate_title_suggestion': GenerateSuggestion.Field(),
    }
