import unittest
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.StoryText.StoryTextService import StoryTextService
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.SceneText.SceneTextService import SceneTextService
from main.modules.BeatSheet.BeatSheetModel import BeatSheetModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.SuggestedStoryTitle.SuggestedStoryTitleModel import SuggestedStoryTitleModel


def collate_project(**kwargs): return f'''
  query {{
    collateProject({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      text
    }}
  }}
'''


class TestProjects(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.project_id = self.create_project_for_test()
        self.create_scenes_for_test(self.project_id, self.user_1)

    def create_scenes_for_test(self, project_id, user):
        for i in range(1, 4):
            scene = SceneTextService.create_scene_text(
                    project_id=project_id,
                    user=user,
                    title=f"Scene {i} Title")
            scene.text_content = f"Scene {i} content"
            scene.text_seed = f"Scene {i} text seed"
            scene.save()
            script = ScriptTextModel.objects(scene_text_id=scene.id).first()
            script.text_content = f"Scene {i}: Script content"
            script.save()

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

        self.assertNotIn('errors', response["data"], f"GraphQL Error: {response.get('errors')}")
        project_id = response["data"]["createProject"]["project"]["id"]
        project = ProjectModel.objects(id=project_id).first()
        story_text = StoryTextModel.objects(project_id=project.id).first()
        story_text.text_seed = "Story Text seed"
        story_text.text_content = "Story Text content"
        story_text.save()
        return project_id

    def test_create_project(self):
        self.assertIsNotNone(self.project_id)

    def test_edit_project(self):
        new_title = "Updated Test Project"
        mutation = f'''
          mutation {{
            updateProject(projectId: "{self.project_id}", title: "{new_title}") {{
              project {{
                id
                title
              }}
            }}
          }}
        '''
        response = self.query_user_1(mutation)

        self.assertTrue('errors' not in response)
        updated_project = response["data"]["updateProject"]["project"]
        self.assertEqual(updated_project["title"], new_title)

    def test_archive_project(self):
        mutation = f'''
          mutation {{
            archiveProject(projectId: "{self.project_id}") {{
              success
            }}
          }}
        '''
        response = self.query_user_1(mutation)
        self.assertTrue('errors' not in response)
        self.assertTrue(response["data"]["archiveProject"]["success"])

    def test_restore_project(self):
        # First archive the project
        self.test_archive_project()

        mutation = f'''
          mutation {{
            restoreProject(projectId: "{self.project_id}") {{
              success
            }}
          }}
        '''
        response = self.query_user_1(mutation)
        self.assertTrue('errors' not in response)
        self.assertTrue(response["data"]["restoreProject"]["success"])

    def test_list_projects(self):
        query = f'''
        query {{
            projects(showArchived: false) {{
                id
                title
            }}
        }}
        '''
        response = self.query_user_1(query)
        projects = response["data"]["projects"]
        self.assertTrue(any(project["id"] == self.project_id for project in projects))

    def test_project_by_id(self):
        query = f'''
        query {{
            projectById(id: "{self.project_id}") {{
                id
                title
            }}
        }}
        '''
        response = self.query_user_1(query)
        project = response["data"]["projectById"]
        self.assertIsNotNone(project)
        self.assertEqual(project["id"], self.project_id)

    def test_clone_project__user_1_clone_project(self):
        mutation = f'''
          mutation {{
            cloneProject(projectId: "{self.project_id}") {{
              success
            }}
          }}
        '''
        projects = ProjectModel.objects(
                members__user=self.user_1,
                members__role='owner').all()
        self.assertEqual(len(projects), 1)
        response = self.query_user_1(mutation)
        self.assertTrue('errors' not in response)
        self.assertTrue(response["data"]["cloneProject"]["success"])
        projects = ProjectModel.objects(
                members__user=self.user_1,
                members__role='owner').all()
        self.assertEqual(len(projects), 2)
        self.assertNotEqual(projects[0].id, projects[1].id)
        self.assertEqual(projects[1].title, f"{projects[0].title} (copy)")

    def test_collate_project__user_query_own_project_defaults(self):
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Scene 1: Script content\n\nScene 2: Script content\n\nScene 3: Script content", resp)

    def test_collate_project__user_query_own_project_detailed_defaults(self):
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "", resp)

    def test_collate_project__user_query_own_project_detailed(self):
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeStoryTitle='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Test Project", resp)
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeStoryText='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Story Text content", resp)
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneTitle='true',
                    includeSceneNumber='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "1. Scene 1 Title\n\n2. Scene 2 Title\n\n3. Scene 3 Title", resp)
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneHint='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Scene 1 text seed\n\nScene 2 text seed\n\nScene 3 text seed", resp)
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneText='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Scene 1 content\n\nScene 2 content\n\nScene 3 content", resp)
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneScript='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Scene 1: Script content\n\nScene 2: Script content\n\nScene 3: Script content", resp)
        resp = self.query_user_1(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeStoryTitle='true',
                    includeStoryText='true',
                    includeSceneTitle='true',
                    includeSceneNumber='true',
                    includeSceneHint='true',
                    includeSceneText='true',
                    includeSceneScript='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Test Project\n\nStory Text content\n\n1. Scene 1 Title\n\nScene 1 text seed\n\nScene 1 content\n\nScene 1: Script content\n\n2. Scene 2 Title\n\nScene 2 text seed\n\nScene 2 content\n\nScene 2: Script content\n\n3. Scene 3 Title\n\nScene 3 text seed\n\nScene 3 content\n\nScene 3: Script content", resp)

    def test_collate_project__admin_query_user_1_project_detailed(self):
        resp = self.query_admin(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeStoryTitle='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Test Project", resp)
        resp = self.query_admin(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeStoryText='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Story Text content", resp)
        resp = self.query_admin(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneTitle='true',
                    includeSceneNumber='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "1. Scene 1 Title\n\n2. Scene 2 Title\n\n3. Scene 3 Title", resp)
        resp = self.query_admin(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneHint='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Scene 1 text seed\n\nScene 2 text seed\n\nScene 3 text seed", resp)
        resp = self.query_admin(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneText='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Scene 1 content\n\nScene 2 content\n\nScene 3 content", resp)
        resp = self.query_admin(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeSceneScript='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Scene 1: Script content\n\nScene 2: Script content\n\nScene 3: Script content", resp)
        resp = self.query_admin(collate_project(
                    projectId=f'"{self.project_id}"',
                    detailed='true',
                    includeStoryTitle='true',
                    includeStoryText='true',
                    includeSceneTitle='true',
                    includeSceneNumber='true',
                    includeSceneHint='true',
                    includeSceneText='true',
                    includeSceneScript='true',
            )
        )
        self.assertEqual(resp["data"]["collateProject"]["text"], "Test Project\n\nStory Text content\n\n1. Scene 1 Title\n\nScene 1 text seed\n\nScene 1 content\n\nScene 1: Script content\n\n2. Scene 2 Title\n\nScene 2 text seed\n\nScene 2 content\n\nScene 2: Script content\n\n3. Scene 3 Title\n\nScene 3 text seed\n\nScene 3 content\n\nScene 3: Script content", resp)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        # Cleanup - delete the test projects and user from the database
        ProjectModel.objects.delete()
