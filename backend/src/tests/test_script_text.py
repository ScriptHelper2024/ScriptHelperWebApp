import unittest
import hashlib
from tests import BaseTestCase
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.SceneText.SceneTextService import SceneTextService
from main.modules.ScriptText.ScriptTextService import ScriptTextService
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from unittest.mock import patch, MagicMock
from bson import ObjectId
from main.modules.Admin.AdminService import AdminService


test_script_text = """
EXT. WILD WEST DESERT - DAY

The relentless orb of fire reigns with unyielding fervor over untamed lands that stretch to infinity beneath an azure dome. Oranges and umbers paint a canvas of heat that wavers above the scorched earth. It is upon this vast, silent expanse that three figures emerge, silhouetted against the glare of the sun, moving as one with the landscape – the very embodiment of the Wild West.

EXT. DUSTY TRAIL - CONTINUOUS

Beneath their mounts, the rhythmic thump of hoofbeats kicks up plumes of dust as <Clay>, <Eve>, and <Mack> traverse the trail, their figures cutting a path through the haze of high noon.

CLAY
(angling his Stetson against the sun)
The sun doth lay its heavy hand upon us with such weight, were it not for the strength of our fellowship, the spirit might wane.

EVE
(surveying the distance with keen eyes)
Yea, for in companionship we find fortitude, as the parched earth finds solace in a passing cloud's merciful shade.

MACK
(with a rumbling laugh)
And yet the journey is less arduous for the burden shared than shouldered alone.

EXT. OPEN RANGE - CONTINUOUS

Amidst the desolation, pandemonium erupts as a HERD OF CATTLE, their hides a tapestry of tans and browns, pour like a frothing river onto the trail. The indomitable <Clay> leads his horse with a casual mastery, a sovereign directing subjects as they veer from the path of ruination.

EVE
(poised atop her horse)
Such chaos dances before us! But see how the beasts' unruly waltz heralds their path, and we shall thusly guide them towards serenity.

MACK
(in a tone that resonates over the clamor)
Fear not, besieged creatures, for we shall steer thee from peril to pasturage.

EXT. SALOON - EVENING

Twilight ushers in a tableau of conviviality as amber light spills from the windows of a SALOON, illuminating the gritty faces of those who seek respite within its walls. But the crack of shattering glass and the discord of raised voices shatter the illusion as the infamous <Black Bart> and his ragtag miscreants lay siege upon civility.

INT. SALOON - CONTINUOUS

Chairs overturned, spirits spilled, the saloon becomes an arena. At its center stands <Clay>, his eyes like flint, his movements a minuet of deadly intent, as each draw of his pistol hammers the air like the final note of a morbid symphony.

BLACK BART
(encroaching with a sinister leer)
<Clay>, son of the sunbaked earth, your legend bleeds like these men who lie stricken!

CLAY
(calculating and smooth as steel)
A legend, <Black Bart>, is but a tale told. My tale is written in the lead I serve, and I do not serve it with parsimony.

EVE
(taking aim from her makeshift barricade)
Let us not parley with scoundrels, but rather dispatch justice from the barrels of our resolve!

As <Eve>'s SHOTS ring out with the precision of a maestro's baton, <Mack> wields his own brand of brute poetry, delivering punishing blows that echo like thunder; mélanges of sweat and blood punctuating each couplet.

In the midst of this bedlam, a GLIMMER of something alien - pixel-like - flashes across <Clay>'s vision, a dissonant note in the opus of their reality.

CLAY
(briefly staring at the oddity)
A trickster's image, delivered by the heat's cruel jest.

Determined to dismiss the vision, <Clay> refocuses, the clarity of danger lending him swift refutation of any disbelief.

CLAY
(shaking off the vision)
A phantasm is nothing compared to the honest steel of my revolver. Stand fast, we are yet unbroken!

As the dust settles, <Clay> and his compatriots stand undaunted, their resolve as indomitable as the desert that witnesses their trials.
"""

class TestScriptText(BaseTestCase):

    def setUp(self):
        super().setUp()

        # Create a project to use for the tests
        self.project_id = self.create_project_for_test()

        self.scene_id, self.scene_key = self.create_scene_for_test()
        self.script_text_id = self.get_latest_script_text_id_for_scene(self.scene_id)
        script = ScriptTextModel.objects(id=self.script_text_id).first()
        script.text_content = test_script_text
        script.save()

        project_profile_prompt = PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text="project_profile_prompt",
            user_context=self.user_1,
        )
        angle_bracket_prompt = PromptTemplateService.register_prompt_template(
            name="angle_bracket_prompt",
            reference_key="angle_bracket_prompt",
            prompt_text="angle_bracket_prompt",
            user_context=self.user_1,
        )
        script_text_system_role_from_scene = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_from_scene",
            reference_key="script_text_system_role_from_scene",
            prompt_text="script_text_system_role_from_scene",
            user_context=self.user_1,
        )
        script_text_user_prompt_from_scene = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_from_scene",
            reference_key="script_text_user_prompt_from_scene",
            prompt_text="script_text_user_prompt_from_scene",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateScriptTextFromScene', {"system_role": str(script_text_system_role_from_scene.id), "user_prompt": str(script_text_user_prompt_from_scene.id)})

        script_text_system_role_with_notes = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_with_notes",
            reference_key="script_text_system_role_with_notes",
            prompt_text="script_text_system_role_with_notes",
            user_context=self.user_1,
        )
        script_text_user_prompt_with_notes = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_with_notes",
            reference_key="script_text_user_prompt_with_notes",
            prompt_text="script_text_user_prompt_with_notes",
            user_context=self.user_1,
        )
        AdminService.update_platform_setting('prompts.generateScriptTextWithNotes', {"system_role": str(script_text_system_role_with_notes.id), "user_prompt": str(script_text_user_prompt_with_notes.id)})

        beat_sheet_system_role_from_scene = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_from_scene",
            reference_key="beat_sheet_system_role_from_scene",
            prompt_text="beat_sheet_system_role_from_scene",
            user_context=self.user_1,
        )
        beat_sheet_user_prompt_from_scene = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_from_scene",
            reference_key="beat_sheet_user_prompt_from_scene",
            prompt_text="beat_sheet_user_prompt_from_scene",
            user_context=self.user_1
        )
        AdminService.update_platform_setting('prompts.generateBeatSheetFromScene', {"system_role": str(beat_sheet_system_role_from_scene.id), "user_prompt": str(beat_sheet_user_prompt_from_scene.id)})


    def create_project_for_test(self, title="Test Project"):
        # Define the metadata input as a GraphQL object, not a JSON string
        metadata_input = "{ genre: \"Science Fiction\" }"
        mutation = f'''
          mutation {{
            createProject(title: "{title}", metadata: {metadata_input}) {{
              project {{
                id
                title
                metadata
              }}
            }}
          }}
        '''
        response = self.query_user_1(mutation)

        assert 'errors' not in response, f"GraphQL Error: {response.get('errors')}"
        project_id = response["data"]["createProject"]["project"]["id"]
        return project_id

    def create_scene_for_test(self):
        # Execute a GraphQL mutation to create a scene text
        scene_order_after = 0
        text_seed = "A beginning of a new adventure"
        title = "Scene One"
        mutation = f'''
          mutation {{
            createSceneText(
              projectId: "{self.project_id}",
              sceneOrderAfter: {0},
              textSeed: "{text_seed}",
              title: "{title}"
            ) {{
              sceneText {{
                id
                sceneKey
                title
                sceneOrder
                textSeed
                textContent
              }}
            }}
          }}
        '''
        response = self.query_user_1(mutation)

        # Assert successful creation and return the scene ID
        assert 'errors' not in response, f"GraphQL Error: {response.get('errors')}"
        scene_id = response["data"]["createSceneText"]["sceneText"]["id"]
        scene_key = response["data"]["createSceneText"]["sceneText"]["sceneKey"]

        return scene_id, scene_key

    def get_latest_script_text_id_for_scene(self, scene_id):
        scene_text = SceneTextModel.objects(id=scene_id).first()
        if not scene_text:
            raise Exception("Scene text not found for the given ID")
        script_text_id = scene_text.getLatestScriptTextId()
        if not script_text_id:
            # If no script text exists, create one here, or raise an exception
            raise Exception("No script text found or created for the scene text")
        return script_text_id

    def test_get_script_text(self):
        script_text = ScriptTextModel.objects(id=self.script_text_id).first()
        script_text.text_content = test_script_text
        script_text.save()
        # Use script_text_id from the class setup
        query = f'''
        query {{
            getScriptText(projectId: "{self.project_id}", textId: "{self.script_text_id}", sceneKey: "{self.scene_key}") {{
                id
                textContent
                versionNumber
            }}
        }}
        '''

        response = self.query_user_1(query)
        data = response['data']['getScriptText']
        self.assertIsNotNone(data)
        self.assertEqual(data['id'], self.script_text_id)
        self.assertEqual(data['textContent'], test_script_text)
        self.assertTrue('textContent' in data)

    def test_get_script_text_formatted(self):
        # Use script_text_id from the class setup
        script_text = ScriptTextModel.objects(id=self.script_text_id).first()
        script_text.text_content = test_script_text
        script_text.save()
        query = f'''
        query {{
            getScriptText(projectId: "{self.project_id}", textId: "{self.script_text_id}", sceneKey: "{self.scene_key}") {{
                id
                textContentFormatted
                versionNumber
            }}
        }}
        '''

        response = self.query_user_1(query)
        data = response['data']['getScriptText']
        self.assertIsNotNone(data)
        self.assertEqual(data['id'], self.script_text_id)
        m = hashlib.sha256(data['textContentFormatted'].encode('UTF-8'))
        self.assertEqual(m.hexdigest(), '7ad5e158dc09624f0f31516d3502a993e7afb05527b42619802b88f9c3e95725')
        self.assertTrue('textContentFormatted' in data)

    def test_export_script__user_1_export_own_txt(self):
        body = {
            "project_id": self.project_id,
            "formatted": False,
        }

        resp = self.client.post('/api/v1/export_script', json=body, headers={
            'Authorization': f'Bearer {self.user_1_access_token}'
        })
        m = hashlib.sha256(resp.get_data())
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(m.hexdigest(), '0d59fc0615a7cad14e4196fad43d746d401c120918e5833641b830cbc90c2c73')

    def test_export_script__user_1_export_own_rtf(self):
        body = {
            "project_id": self.project_id,
            "formatted": True,
        }

        resp = self.client.post('/api/v1/export_script', json=body, headers={
            'Authorization': f'Bearer {self.user_1_access_token}'
        })
        m = hashlib.sha256(resp.get_data())
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(m.hexdigest(), '7ad5e158dc09624f0f31516d3502a993e7afb05527b42619802b88f9c3e95725')

    def test_export_script__user_2_export_user_1_txt(self):
        body = {
            "project_id": self.project_id,
            "formatted": False,
        }

        resp = self.client.post('/api/v1/export_script', json=body, headers={
            'Authorization': f'Bearer {self.user_2_access_token}'
        })
        m = hashlib.sha256(resp.get_data())
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.get_json()['msg'], 'Insufficient permissions for the operation')

    def test_get_script_text_versions(self):
        # Assume we already have a scene_key from a created scene
        query = f'''
        query {{
            listScriptTextVersions(projectId: "{self.project_id}",sceneKey: "{self.scene_key}") {{
                id
                versionNumber
            }}
        }}
        '''

        response = self.query_user_1(query)
        versions = response['data']['listScriptTextVersions']
        self.assertIsInstance(versions, list)
        self.assertGreater(len(versions), 0)  # Check that at least one version is returned

    def test_rebase_script_text(self):
        new_version_number = 1

        mutation = f'''
        mutation {{
            rebaseScriptText(
                sceneKey: "{self.scene_key}",
                projectId: "{self.project_id}",
                versionNumber: {new_version_number}
            ) {{
                success
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['rebaseScriptText']
        self.assertTrue(data['success'])

    def test_update_script_text_version_label(self):
        # We'll use the existing script_text_id and assume it has the correct version to update the label
        version_number_to_update = 1  # This version number should be existing in your test data
        new_version_label = "Updated Version"

        mutation = f'''
        mutation {{
            updateScriptTextVersionLabel(
                sceneKey: "{self.scene_key}",
                projectId: "{self.project_id}",
                versionNumber: {version_number_to_update},
                versionLabel: "{new_version_label}"
            ) {{
                success
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['updateScriptTextVersionLabel']
        self.assertTrue(data['success'])

    def test_update_script_text(self):
        # Use scene_key, project_id, and text_id from the class setup
        new_text_content = "This is the updated content for the new version of the script text."
        new_text_notes = "These are the new notes for the script text."

        mutation = f'''
        mutation {{
            updateScriptText(
                sceneTextId: "{self.scene_id}",
                textId: "{self.script_text_id}",
                projectId: "{self.project_id}",
                textNotes: "{new_text_notes}",
                textContent: "{new_text_content}"
            ) {{
                scriptText {{
                    id
                    textContent
                    textNotes
                }}
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['updateScriptText']
        self.assertIsNotNone(data)
        self.assertIsNotNone(data['scriptText'])
        self.assertEqual(data['scriptText']['textContent'], new_text_content)
        self.assertEqual(data['scriptText']['textNotes'], new_text_notes)

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_script_text_from_scene(self, mock_pika):

        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Use the IDs from the class setup (scene_key, text_id, scene_text_id, project_id)
        mutation = f'''
        mutation {{
            generateScriptTextFromScene(
                sceneKey: "{self.scene_key}",
                textId: "{self.script_text_id}",
                sceneTextId: "{self.scene_id}",
                projectId: "{self.project_id}"
            ) {{
                agentTaskId
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['generateScriptTextFromScene']
        self.assertIsNotNone(data['agentTaskId'])

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_script_text_with_notes(self, mock_pika):

        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Use the IDs from the class setup (scene_key, text_id, project_id) and add text notes
        text_notes = "These are the test notes for the script text."
        mutation = f'''
        mutation {{
            generateScriptTextWithNotes(
                sceneKey: "{self.scene_key}",
                textId: "{self.script_text_id}",
                textNotes: "{text_notes}",
                projectId: "{self.project_id}"
            ) {{
                agentTaskId
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['generateScriptTextWithNotes']
        self.assertIsNotNone(data['agentTaskId'])

    @patch('main.libraries.QueueHelper.pika')
    def test_generate_script_and_beat_sheet(self, mock_pika):

        # Mock the components of pika used in QueueHelper.publish_task
        mock_connection = MagicMock()
        mock_channel = MagicMock()

        mock_pika.BlockingConnection.return_value = mock_connection
        mock_connection.channel.return_value = mock_channel

        # Use the IDs from the class setup (scene_key, text_id, project_id) and add text notes
        mutation = f'''
        mutation {{
            generateScriptAndBeatSheet(
                sceneKey: "{self.scene_key}",
                sceneTextId: "{self.scene_id}",
                projectId: "{self.project_id}"
            ) {{
                agentTaskId
            }}
        }}
        '''

        response = self.query_user_1(mutation)

        data = response['data']['generateScriptAndBeatSheet']
        self.assertIsNotNone(data['agentTaskId'])

    def tearDown(self):
        super().tearDown()
        # Cleanup - delete the test story texts, projects and user from the database
        PromptTemplateModel.objects.delete()
        ScriptTextModel.objects.delete()
        BeatSheetModel.objects.delete()
        SceneTextModel.objects.delete()
        StoryTextModel.objects.delete()
        ProjectModel.objects.delete()
