import graphene
from graphene import ObjectType, Mutation, Field, NonNull, ID, String, List, Argument, Int, Boolean
from .MagicNoteService import MagicNoteService
from graphql import GraphQLError
from main.libraries.decorators import admin_required, project_role, cache_response
from main.libraries.PagedResult import PagedResult

class MagicNoteCritic(ObjectType):
    id = graphene.ID(required=True)
    user_id = graphene.ID(required=True)
    user_email = graphene.ID(required=True)
    active = graphene.Boolean(required=True)
    name = graphene.String(required=True)
    order_rank = graphene.Int(required=True)
    story_text_prompt = graphene.String()
    scene_text_prompt = graphene.String()
    beat_sheet_prompt = graphene.String()
    script_text_prompt = graphene.String()
    created_at = graphene.String()
    updated_at = graphene.String()

    @classmethod
    @admin_required(required_level=1)
    @cache_response("magic_note_critic_", "critic_id")
    def resolve_get_magic_note_critic(cls, info, critic_id):
        critic = MagicNoteService.get_magic_note_critic_by_id(critic_id)
        return critic._to_dict() if critic else None

    @classmethod
    @admin_required(required_level=1)
    @cache_response("magic_note_critics_", "name", "activeOnly", "page", "limit")
    def resolve_list_magic_note_critics(cls, info, **args):
        critics, pages, statistics = MagicNoteService.list_all_magic_note_critics(**args)
        return MagicNotesCriticsPagedWithStatistics(magic_note_critics=[critic._to_dict() for critic in critics], pages=pages, statistics=statistics)

    @classmethod
    @cache_response("magic_note_critics_type_", "document_type")
    def resolve_list_magic_note_critics_by_type(cls, info, document_type):
        critics = MagicNoteService.list_magic_note_critics_by_type(document_type)
        # Only include ID and name in the response
        return [{'id': critic['id'], 'name': critic['name']} for critic in critics]

class CreateMagicNoteCritic(Mutation):
    class Arguments:
        name = String(required=True)
        active = Boolean(default_value=False)
        order_rank = Int(default_value=0)
        story_text_prompt = String()
        scene_text_prompt = String()
        beat_sheet_prompt = String()
        script_text_prompt = String()

    magic_note_critic = Field(MagicNoteCritic)

    @admin_required(required_level=1)
    def mutate(self, info, name, active, order_rank, story_text_prompt=None, scene_text_prompt=None, beat_sheet_prompt=None, script_text_prompt=None):
        user = info.context.get('user')
        try:
            new_magic_note_critic = MagicNoteService.create_magic_note_critic(
                user, name, active, order_rank, story_text_prompt, scene_text_prompt, beat_sheet_prompt, script_text_prompt
            )
            return CreateMagicNoteCritic(magic_note_critic=new_magic_note_critic._to_dict())
        except Exception as e:
            raise GraphQLError(f'Error creating Magic Note Critic: {str(e)}')


class UpdateMagicNoteCritic(Mutation):
    class Arguments:
        critic_id = ID(required=True)
        active = Boolean()
        name = String()
        order_rank = Int()
        story_text_prompt = String()
        scene_text_prompt = String()
        beat_sheet_prompt = String()
        script_text_prompt = String()

    magic_note_critic = Field(MagicNoteCritic)

    @admin_required(required_level=1)
    def mutate(self, info, critic_id, active=None, name=None, order_rank=None,
               story_text_prompt=None, scene_text_prompt=None,
               beat_sheet_prompt=None, script_text_prompt=None):
        try:
            updated_magic_note_critic = MagicNoteService.update_magic_note_critic(
                critic_id, active, name, order_rank,
                story_text_prompt, scene_text_prompt,
                beat_sheet_prompt, script_text_prompt
            )
            return UpdateMagicNoteCritic(magic_note_critic=updated_magic_note_critic._to_dict())
        except Exception as e:
            raise GraphQLError(f'Error updating Magic Note Critic: {str(e)}')

class DeleteMagicNoteCritic(Mutation):
    class Arguments:
        critic_id = ID(required=True)

    success = Boolean()

    @admin_required(required_level=1)
    def mutate(self, info, critic_id):
        try:
            result_message = MagicNoteService.delete_magic_note_critic(critic_id)
            if result_message:
                return DeleteMagicNoteCritic(success=True)
            else:
                return DeleteMagicNoteCritic(success=False)
        except Exception as e:
            raise GraphQLError(f'Error deleting Magic Note Critic: {str(e)}')

class GenerateMagicNotes(Mutation):
    class Arguments:
        project_id = ID(required=True)
        document_type = String(required=True)
        document_id = ID(required=True)
        critic_ids = List(ID)  # This is an optional list of critic IDs

    agent_task_id = String()

    @project_role(roles="owner")
    def mutate(self, info, project_id, document_type, document_id, critic_ids=None):
        try:
            user = info.context.get('user')
            agent_task_id = MagicNoteService.generate_magic_notes(
                project_id, document_type, document_id, critic_ids, str(user.id)
            )
            return GenerateMagicNotes(agent_task_id=str(agent_task_id))
        except Exception as e:
            raise GraphQLError(f'Error generating magic notes: {str(e)}')

class GenerateExpansiveNotes(Mutation):
    class Arguments:
        project_id = ID(required=True)
        document_type = String(required=True)
        document_id = ID(required=True)

    agent_task_id = String()

    @project_role(roles="owner")
    def mutate(self, info, project_id, document_type, document_id):
        try:
            user = info.context.get('user')
            agent_task_id = MagicNoteService.generate_expansive_notes(
                project_id, document_type, document_id, str(user.id)
            )
            return GenerateExpansiveNotes(agent_task_id=str(agent_task_id))
        except Exception as e:
            raise GraphQLError(f'Error generating expansive magic notes: {str(e)}')

class MagicNoteCriticsPaged(PagedResult):
    magic_note_critics = NonNull(List(NonNull(MagicNoteCritic)))

class MagicNoteCriticsStatistics(ObjectType):
    total = NonNull(Int)
    active_count = NonNull(Int)
    inactive_count = NonNull(Int)

class MagicNotesCriticsPagedWithStatistics(MagicNoteCriticsPaged):
    statistics = NonNull(MagicNoteCriticsStatistics)

# Define the get_query_fields function to register query resolvers
def get_query_fields():
    return {
        'get_magic_note_critic': Field(
            MagicNoteCritic,
            critic_id=Argument(ID, required=True),
            resolver=lambda self, info, **args: MagicNoteCritic.resolve_get_magic_note_critic(info, **args)
        ),
        'list_magic_note_critics': Field(
            MagicNotesCriticsPagedWithStatistics,
            name=Argument(String),
            activeOnly=Argument(Boolean),
            page=Argument(Int),
            limit=Argument(Int),
            resolver=lambda self, info, **args: MagicNoteCritic.resolve_list_magic_note_critics(info, **args)
        ),
        'list_magic_note_critics_by_type': List(
            MagicNoteCritic,
            document_type=Argument(String, required=True),
            resolver=lambda self, info, **args: MagicNoteCritic.resolve_list_magic_note_critics_by_type(info, **args)
        )
    }

# Function to register mutation fields
def get_mutation_fields():
    return {
        'create_magic_note_critic': CreateMagicNoteCritic.Field(),
        'update_magic_note_critic': UpdateMagicNoteCritic.Field(),
        'delete_magic_note_critic': DeleteMagicNoteCritic.Field(),
        'generate_magic_notes': GenerateMagicNotes.Field(),
        'generate_expansive_notes': GenerateExpansiveNotes.Field(),
    }
