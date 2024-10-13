"""
Prompt Template Schema

This file defines the Prompt Template GraphQL object type and all mutations associated with a Prompt Template.
"""
# Import the required modules
from graphene import ObjectType, String, Mutation, Field, ID, Boolean, Int, Argument, List, NonNull
from .PromptTemplateService import PromptTemplateService
from graphql import GraphQLError
from main.libraries.decorators import admin_required, cache_response
from main.libraries.PagedResult import PagedResult

# Define the PromptTemplate ObjectType
class PromptTemplate(ObjectType):
    """ PromptTemplate GraphQL Object """

    id = ID(required=False)
    name = String(required=False)
    reference_key = String(required=False)
    prompt_text = String()
    user_id = ID(required=False)
    creator_email = String(required=False)
    created_at = String()
    modified_at = String()
    assigned_settings = List(of_type=String, required=False)

    @classmethod
    @admin_required(required_level=1)
    @cache_response("prompt_template_", "id")
    def resolve_by_id(cls, root, info, id):
        """ GraphQL Resolver to fetch an Prompt Template by ID """

        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use PromptTemplateService to find prompt template by ID
            prompt_template = PromptTemplateService.find_by_id(id, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if prompt template not found
            raise GraphQLError(str(e))

        # Return PromptTemplate object
        return cls(**prompt_template.to_dict())

    @classmethod
    @admin_required(required_level=1)
    @cache_response("prompt_templates_", "page", "limit", "search_term")
    def resolve_all_prompt_templates(cls, root, info, page=1, limit=None, search_term=None):
        """ GraphQL Resolver to fetch all PromptTemplate with optional pagination and filter by Email """
        try:
            # Retrieve the user from the context passed in by the JWT middleware
            user_context = info.context.get('user')

            # Use PromptTemplateService to find all prompt templates
            prompt_templates, pages, statistics = PromptTemplateService.find_all(page, limit, search_term, user_context=user_context)

        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Convert prompt templates to list of PromptTemplate objects
        prompt_templates_list = [cls(**prompt_template.to_dict()) for prompt_template in prompt_templates]
        return AllPromptTemplates(promptTemplates=prompt_templates_list, pages=pages, statistics=statistics)

class PromptTemplateStatistics(ObjectType):
    total_prompt_templates_count = NonNull(Int)

# Define a new type to contain the Author Style list and the total page count
class AllPromptTemplates(PagedResult):
    promptTemplates = NonNull(List(NonNull(PromptTemplate)))
    statistics = NonNull(PromptTemplateStatistics)

# Define the RegisterPromptTemplate Mutation
class RegisterPromptTemplate(Mutation):
    """ RegisterPromptTemplate Mutation to create a new PromptTemplate"""

    prompt_template = Field(PromptTemplate)

    class Arguments:
        name = String(required=True)
        reference_key = String(required=True)
        prompt_text = String(required=True)

    @admin_required(required_level=1)
    def mutate(self, info, name, reference_key, prompt_text):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Register a new prompt template using PromptTemplateService
            prompt_template = PromptTemplateService.register_prompt_template(name, reference_key, prompt_text, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if any error
            raise GraphQLError(str(e))

        # Return the created prompt template
        return RegisterPromptTemplate(prompt_template=prompt_template.to_dict())

# Define the DeletePromptTemplate Mutation
class DeletePromptTemplate(Mutation):
    """ DeletePromptTemplate Mutation to delete an PromptTemplate"""

    class Arguments:
        id = ID(required=True)

    Output = Boolean

    @admin_required(required_level=1)
    def mutate(self, info, id):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Delete prompt template using PromptTemplateService
            is_deleted = PromptTemplateService.delete_prompt_template(id, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if prompt template not found
            raise GraphQLError(str(e))

        # Return True if prompt template has been deleted
        return is_deleted is not None

# Define the UpdatePromptTemplate Mutation
class UpdatePromptTemplate(Mutation):
    """ UpdatePromptTemplate Mutation to update an Prompt Template's name or prompt text"""

    prompt_template = Field(PromptTemplate)

    class Arguments:
        id = ID(required=True)
        name = String(required=False, default_value=None)
        reference_key = String(required=True, default_value=None)
        prompt_text = String(required=False, default_value=None)

    @admin_required(required_level=1)
    def mutate(self, info, id, name, reference_key, prompt_text):
        """ Resolve the mutation """

        user_context = info.context.get('user', None)

        try:
            # Update prompt template using PromptTemplateService
            prompt_template = PromptTemplateService.update_prompt_template(id, name, reference_key, prompt_text, user_context=user_context)
        except ValueError as e:
            # Raise GraphQLError if prompt template not found or email already in use
            raise GraphQLError(str(e))

        # Return the updated user
        return UpdatePromptTemplate(prompt_template=prompt_template.to_dict())

def get_query_fields():
    return {
        'prompt_template_by_id': Field(PromptTemplate, id=Argument(ID, required=True), resolver=PromptTemplate.resolve_by_id),
        'all_prompt_templates': Field(AllPromptTemplates, page=Int(default_value=1), limit=Int(), search_term=String(), resolver=PromptTemplate.resolve_all_prompt_templates),
    }

def get_mutation_fields():
    return {
        'register_prompt_template': RegisterPromptTemplate.Field(),
        'delete_prompt_template': DeletePromptTemplate.Field(),
        'update_prompt_template': UpdatePromptTemplate.Field(),
    }
