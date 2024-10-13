from flask import Blueprint, request, Response, g, jsonify
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.ScriptText.ScriptTextService import ScriptTextService
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.SceneText.SceneTextService import SceneTextService  # Import SceneTextService
from main.libraries.RichText import cleanup_script_array, assemble_formatted_from_script_array_rtf

export_script = Blueprint("export", __name__)

@export_script.route("/api/v1/export_script", methods=["POST"])
def webhooks():
    try:
        user = g.get('user')
        req = request.json

        project_id = req.get('project_id')  # Required for permissions check
        formatted = req.get('formatted')

        # Load the project and check if it exists
        project = ProjectModel.objects(id=project_id).first()
        if not project:
            return jsonify({'msg': 'Project not found'}), 404

        # Check user membership and roles within the project
        acceptable_roles = ['owner', 'member']
        allowed = lambda m: m.user.id == user.id and m.role in acceptable_roles
        members = list(m.user.id for m in filter(allowed, project.members))

        if user.id not in members:
            return jsonify({'msg': 'Insufficient permissions for the operation'}), 403

        output = []

        # Use the SceneTextService to get the latest scenes for the project
        scene_texts = SceneTextService.list_project_scenes(project_id)

        for scene in scene_texts:
            script_id = scene['latest_script_text_id']  # Access the ID from the dictionary
            script = ScriptTextModel.objects(id=script_id).first()
            if script and script.text_content is not None:
                output.append(script.text_content)

        if formatted:
            lines = cleanup_script_array('\n\n'.join(output))
            body = assemble_formatted_from_script_array_rtf(lines)
            mimetype = 'text/rtf'
            filename = f'{project.title.strip()}.rtf'
        else:
            body = '\n\n'.join(output)
            mimetype = 'text/plain'
            filename = f'{project.title.strip()}.txt'

        return Response(
                body,
                mimetype=mimetype,
                headers={
                    'Content-disposition':
                    f'attachment; filename={filename}'
                })

    except Exception as e:
        return jsonify({'msg': 'Error retrieving script text', 'err': str(e)}), 500

    return jsonify({'msg': 'The application encountered an error'}), 500
