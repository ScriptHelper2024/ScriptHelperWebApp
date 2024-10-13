from main.libraries.EncryptedDocument import EncryptedDocument
from mongoengine import Document, StringField, IntField, FloatField, DateTimeField, DictField, BooleanField, ReferenceField
from datetime import datetime
from bson import ObjectId
import json
from main.modules.Project.ProjectModel import ProjectModel

# Define the custom serializer function
def serialize_complex_obj(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, (list, dict)):
        return json.loads(json.dumps(obj, default=str))
    return obj

agent_task_status_choices = ('pending', 'processing', 'completed', 'error')

class AgentTaskModel(EncryptedDocument):
    # Define the collection name
    meta = {
        'collection': 'agent_tasks',
        'encrypted_fields': ['prompt_text', 'system_role', 'agent_results']
    }

    project_id = ReferenceField(ProjectModel)
    status = StringField(required=True, choices=agent_task_status_choices)
    status_message = StringField()
    llm_model = StringField(required=True)
    max_input_tokens = IntField()
    max_output_tokens = IntField()
    temperature = FloatField()
    prompt_text = StringField()
    system_role = StringField()
    document_type = StringField(required=True)
    document_id = StringField(required=True)
    metadata = DictField()
    input_tokens_used = IntField()
    output_tokens_used = IntField()
    process_time = IntField()  # measured in seconds
    agent_results = StringField()
    agent_id = StringField(default=None)
    errors = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    processing_at = DateTimeField()
    updated_at = DateTimeField(default=datetime.utcnow)

    # Automatically update the updated_at field on save
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(AgentTaskModel, self).save(*args, **kwargs)

    def _to_dict(self, for_project=False):
        """Format an AgentTaskModel instance into a dictionary"""

        project_id = None
        if self.project_id:
            project_id = str(self.project_id.id)

        if for_project:
            #Cleaned version with minimal data for frontend UI
            return {
                'id': str(self.id),
                'project_id': project_id,
                'status': self.status,
                'status_message': self.status_message,
                'llm_model': self.llm_model,
                'document_type': self.document_type,
                'document_id': str(self.document_id),
                'input_tokens_used': self.input_tokens_used,
                'output_tokens_used': self.output_tokens_used,
                'process_time': self.process_time,
                'created_at': self.created_at,
                'processing_at': self.processing_at,
                'updated_at': self.updated_at,
            }
        else:
            #Full data, for agents and admins
            return {
                'id': str(self.id),
                'project_id': project_id,
                'status': self.status,
                'status_message': self.status_message,
                'llm_model': self.llm_model,
                'max_input_tokens': self.max_input_tokens,
                'max_output_tokens': self.max_output_tokens,
                'temperature': self.temperature,
                'prompt_text': self.prompt_text,
                'system_role': self.system_role,
                'document_type': self.document_type,
                'document_id': str(self.document_id),
                'metadata': serialize_complex_obj(self.metadata),
                'input_tokens_used': self.input_tokens_used,
                'output_tokens_used': self.output_tokens_used,
                'process_time': self.process_time,
                'agent_results': self.agent_results,
                'agent_id': self.agent_id,
                'errors': self.errors,
                'created_at': self.created_at,
                'processing_at': self.processing_at,
                'updated_at': self.updated_at,
            }
