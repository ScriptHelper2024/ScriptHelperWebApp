import unittest
from tests import BaseTestCase, webhook
from main.modules.User.UserModel import UserModel
from main.modules.PromptTemplate.PromptTemplateModel import PromptTemplateModel


def mutation_register_prompt_template(**kwargs): return f'''
  mutation {{
    registerPromptTemplate({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      promptTemplate {{
        id
        name
        referenceKey
        promptText
        userId
      }}
    }}
  }}
'''

def mutation_update_prompt_template(**kwargs): return f'''
  mutation {{
    updatePromptTemplate({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      promptTemplate {{
        id
        name
        referenceKey
        promptText
        userId
      }}
    }}
  }}
'''

def mutation_delete_prompt_template(id): return f'''
  mutation {{
    deletePromptTemplate(id: "{id}")
  }}
'''

def query_prompt_template_by_id(id): return f'''
  query {{
    promptTemplateById(id: "{id}") {{
      id
      name
      referenceKey
      promptText
      userId
    }}
  }}
'''

def query_all_prompt_template(page, limit): return f'''
  query {{
    allPromptTemplates(page: {page}, limit: {limit}) {{
      promptTemplates {{
        id
        name
        referenceKey
        promptText
        userId
      }}
    }}
  }}
'''

class TestPromptTemplates(BaseTestCase):

    def setUp(self):
        super().setUp()

        response_admin = self.query_admin(
                mutation_register_prompt_template(
                    name='"test_prompt_template"',
                    referenceKey='"test_ref_key"',
                    promptText='"test prompt"',
                )
        )

        self.assertEqual(response_admin["data"]["registerPromptTemplate"]["promptTemplate"]["userId"], str(self.admin.id))
        self.admin_prompt_template = PromptTemplateModel.objects.get(id=response_admin["data"]["registerPromptTemplate"]["promptTemplate"]["id"])

    def tearDown(self):
        super().tearDown()
        PromptTemplateModel.objects.delete()

    def test_prompt_template_by_id__admin_retrieve_own_prompt_template(self):
        resp = self.query_admin(query_prompt_template_by_id(
                    id=self.admin_prompt_template.id,
            )
        )
        self.assertEqual(resp["data"]["promptTemplateById"]["userId"], str(self.admin.id))

    def test_prompt_template_by_id__user_retrieve_admin_prompt_template(self):
        resp = self.query_user_1(query_prompt_template_by_id(
                    id=self.admin_prompt_template.id,
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Not authorized: insufficient admin level")
        self.assertIsNone(resp["data"]["promptTemplateById"])

    def test_all_prompt_templates__admin_retrieve_all_prompt_template(self):
        resp = self.query_admin(query_all_prompt_template(
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allPromptTemplates"]), 1)

    def test_all_prompt_templates__user_retrieve_all_prompt_template(self):
        resp = self.query_user_1(query_all_prompt_template(
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Not authorized: insufficient admin level")
        self.assertIsNone(resp["data"]["allPromptTemplates"])

    def test_update_prompt_template__admin_update_prompt_template_defaults(self):
        resp = self.query_admin(mutation_update_prompt_template(
                    id=f'"{self.admin_prompt_template.id}"',
            )
        )
        self.assertEqual(resp["data"]["updatePromptTemplate"]["promptTemplate"]["name"], "test_prompt_template")
        self.assertEqual(resp["data"]["updatePromptTemplate"]["promptTemplate"]["referenceKey"], "test_ref_key")
        self.assertEqual(resp["data"]["updatePromptTemplate"]["promptTemplate"]["promptText"], "test prompt")

    def test_update_prompt_template__admin_update_own_prompt_template(self):
        resp = self.query_admin(mutation_update_prompt_template(
                    id=f'"{self.admin_prompt_template.id}"',
                    name='"new_prompt_template"',
                    referenceKey='"new_ref_key"',
                    promptText='"new prompt"',
            )
        )
        self.assertEqual(resp["data"]["updatePromptTemplate"]["promptTemplate"]["name"], "new_prompt_template")
        self.assertEqual(resp["data"]["updatePromptTemplate"]["promptTemplate"]["referenceKey"], "new_ref_key")
        self.assertEqual(resp["data"]["updatePromptTemplate"]["promptTemplate"]["promptText"], "new prompt")

    def test_update_prompt_template__user_update_admin_prompt_template(self):
        resp = self.query_user_1(mutation_update_prompt_template(
                    id=f'"{self.admin_prompt_template.id}"',
                    name='"new_prompt_template"',
                    referenceKey='"new_ref_key"',
                    promptText='"new prompt"',
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Not authorized: insufficient admin level")
        self.assertIsNone(resp["data"]["updatePromptTemplate"])

    def test_delete_prompt_template__admin_delete_own_prompt_template(self):
        resp = self.query_admin(mutation_delete_prompt_template(
                    id=str(self.admin_prompt_template.id),
            )
        )
        self.assertTrue(resp["data"]["deletePromptTemplate"])

    def test_delete_prompt_template__user_delete_admin_prompt_template(self):
        resp = self.query_user_1(mutation_delete_prompt_template(
                    id=str(self.admin_prompt_template.id),
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Not authorized: insufficient admin level")

    def test_register_prompt_template__render_template_with_variables(self):
        resp = self.query_admin(
                mutation_register_prompt_template(
                    name='"test_prompt_template"',
                    referenceKey='"test_ref_key"',
                    promptText='"test prompt <<test_variable>>"',
                )
        )
        template = PromptTemplateModel.objects.get(id=resp["data"]["registerPromptTemplate"]["promptTemplate"]["id"])
        rendered = template.render(test_variable="test variable value")
        self.assertEqual(rendered, "test prompt test variable value")

    def test_register_prompt_template__render_template_with_loop(self):
        resp = self.query_admin(
                mutation_register_prompt_template(
                    name='"test_prompt_template"',
                    referenceKey='"test_ref_key"',
                    promptText='''"""<<heading>>[% for i in range(3) %]\ntest variable <<i>>[% endfor %]"""''',
                )
        )
        template = PromptTemplateModel.objects.get(id=resp["data"]["registerPromptTemplate"]["promptTemplate"]["id"])
        rendered = template.render(heading="output")
        self.assertEqual(rendered, """output\ntest variable 0\ntest variable 1\ntest variable 2""")


if __name__ == "__main__":
    unittest.main()
