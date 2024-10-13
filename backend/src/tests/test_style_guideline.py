import unittest
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel
from main.modules.StyleGuideline.StyleGuidelineModel import StyleGuidelineModel


def mutation_register_style_guideline(**kwargs): return f'''
  mutation {{
    registerStyleGuideline({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      styleGuideline {{
        id
        name
        promptText
        userId
        archived
        isGlobal
      }}
    }}
  }}
'''

def mutation_update_style_guideline(**kwargs): return f'''
  mutation {{
    updateStyleGuideline({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      styleGuideline {{
        id
        name
        promptText
        userId
        archived
        isGlobal
      }}
    }}
  }}
'''

def mutation_delete_style_guideline(id): return f'''
  mutation {{
    deleteStyleGuideline(id: "{id}")
  }}
'''

def query_style_guideline_by_id(id, include_archived, include_global): return f'''
  query {{
    styleGuidelineById(id: "{id}", includeArchived: {include_archived}, includeGlobal: {include_global}) {{
      id
      name
      promptText
      userId
      archived
      isGlobal
    }}
  }}
'''

def query_all_style_guideline(include_archived, global_only, page, limit): return f'''
  query {{
    allStyleGuidelines(includeArchived: {include_archived}, globalOnly: {global_only}, page: {page}, limit: {limit}) {{
      styleGuidelines {{
        id
        name
        promptText
        userId
        archived
        isGlobal
      }}
      pages
    }}
  }}
'''

class TestStyleGuidelines(BaseTestCase):

    def setUp(self):
        super().setUp()

        response_admin = self.query_admin(
                mutation_register_style_guideline(
                    name='"test_style_guideline"',
                    promptText='"test prompt"',
                    archived="false",
                    isGlobal="false",
                )
        )
        response_user = self.query_user_1(
                mutation_register_style_guideline(
                    name='"test_style_guideline"',
                    promptText='"test prompt"',
                    archived="false",
                    isGlobal="false",
                )
        )
        self.assertEqual(response_admin["data"]["registerStyleGuideline"]["styleGuideline"]["userId"], str(self.admin.id))
        self.assertEqual(response_user["data"]["registerStyleGuideline"]["styleGuideline"]["userId"], str(self.user_1.id))
        self.admin_style_guideline = StyleGuidelineModel.objects.get(id=response_admin["data"]["registerStyleGuideline"]["styleGuideline"]["id"])
        self.user_style_guideline = StyleGuidelineModel.objects.get(id=response_user["data"]["registerStyleGuideline"]["styleGuideline"]["id"])

    def tearDown(self):
        super().tearDown()
        StyleGuidelineModel.objects.delete()

    def test_style_guideline_by_id__admin_retrieve_own_style_guideline(self):
        resp = self.query_admin(query_style_guideline_by_id(
                    id=self.admin_style_guideline.id,
                    include_archived="false",
                    include_global="false",
            )
        )
        self.assertEqual(resp["data"]["styleGuidelineById"]["userId"], str(self.admin.id))
        self.assertEqual(resp["data"]["styleGuidelineById"]["promptText"], "test prompt")

    def test_style_guideline_by_id__admin_retrieve_user_style_guideline(self):
        resp = self.query_admin(query_style_guideline_by_id(
                    id=self.user_style_guideline.id,
                    include_archived="false",
                    include_global="false",
            )
        )
        self.assertEqual(resp["data"]["styleGuidelineById"]["userId"], str(self.user_1.id))
        self.assertEqual(resp["data"]["styleGuidelineById"]["promptText"], "test prompt")

    def test_style_guideline_by_id__admin_retrieve_archived_own_style_guideline(self):
        self.admin_style_guideline.archived = True
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()

        # test don't return archived results
        resp = self.query_admin(query_style_guideline_by_id(
                    id=self.admin_style_guideline.id,
                    include_archived="false",
                    include_global="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Style Guideline not found")
        self.assertIsNone(resp["data"]["styleGuidelineById"])

        # test do return archived results
        resp = self.query_admin(query_style_guideline_by_id(
                    id=self.admin_style_guideline.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["data"]["styleGuidelineById"]["userId"], str(self.admin.id))

    def test_style_guideline_by_id__user_retrieve_global_style_guideline(self):
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()

        # test don't return global results
        resp = self.query_user_1(query_style_guideline_by_id(
                    id=self.admin_style_guideline.id,
                    include_archived="false",
                    include_global="false",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Style Guideline not found")
        self.assertIsNone(resp["data"]["styleGuidelineById"])

        # test do return global results
        resp = self.query_user_1(query_style_guideline_by_id(
                    id=self.admin_style_guideline.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["data"]["styleGuidelineById"]["userId"], str(self.admin.id))
        self.assertIsNone(resp["data"]["styleGuidelineById"]["promptText"])

    def test_style_guideline_by_id__user_retrieve_archived_global_style_guideline(self):
        self.admin_style_guideline.archived = True
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()

        resp = self.query_user_1(query_style_guideline_by_id(
                    id=self.admin_style_guideline.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Style Guideline not found")
        self.assertIsNone(resp["data"]["styleGuidelineById"])

    def test_style_guideline_by_id__user_retrieve_admin_style_guideline(self):
        resp = self.query_user_1(query_style_guideline_by_id(
                    id=self.admin_style_guideline.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Style Guideline not found")
        self.assertIsNone(resp["data"]["styleGuidelineById"])

    def test_all_style_guidelines__admin_retrieve_all_style_guideline(self):
        resp = self.query_admin(query_all_style_guideline(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 2)
        [self.assertEqual(r["promptText"], "test prompt") for r in resp["data"]["allStyleGuidelines"]["styleGuidelines"]]

    def test_all_style_guidelines__user_retrieve_all_style_guideline(self):
        resp = self.query_user_1(query_all_style_guideline(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 1)
        [self.assertEqual(r["promptText"], "test prompt") for r in resp["data"]["allStyleGuidelines"]["styleGuidelines"]]
        self.assertEqual(resp["data"]["allStyleGuidelines"]["pages"], 1)

    def test_all_style_guidelines__admin_retrieve_archived_own_style_guideline(self):
        self.admin_style_guideline.archived = True
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()

        # test don't return archived results
        resp = self.query_admin(query_all_style_guideline(
                    include_archived="false",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 1)

        # test do return archived results
        resp = self.query_admin(query_all_style_guideline(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 2)

    def test_all_style_guidelines__user_retrieve_only_global_style_guideline(self):
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()

        # test don't return only global results
        resp = self.query_user_1(query_all_style_guideline(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 2)

        # test do return only global results
        resp = self.query_user_1(query_all_style_guideline(
                    include_archived="true",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 1)

    def test_all_style_guidelines__user_retrieve_admin_style_guideline(self):
        resp = self.query_user_1(query_all_style_guideline(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 1)

    def test_all_style_guidelines__user_retrieve_archived_global_style_guideline(self):
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()


        resp = self.query_user_1(query_all_style_guideline(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )

        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 2)

        self.admin_style_guideline.archived = True
        self.admin_style_guideline.save()

        resp = self.query_user_1(query_all_style_guideline(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allStyleGuidelines"]["styleGuidelines"]), 1)

    def test_all_style_guidelines__admin_retrieve_global_style_guideline_private_fields(self):
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()
        self.user_style_guideline.is_global = True
        self.user_style_guideline.save()

        resp = self.query_admin(query_all_style_guideline(
                    include_archived="false",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        [self.assertEqual(r["promptText"], "test prompt") for r in resp["data"]["allStyleGuidelines"]["styleGuidelines"]]

    def test_all_style_guidelines__user_retrieve_global_style_guideline_private_fields(self):
        self.admin_style_guideline.is_global = True
        self.admin_style_guideline.save()
        self.user_style_guideline.is_global = True
        self.user_style_guideline.save()

        resp = self.query_user_1(query_all_style_guideline(
                    include_archived="false",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )

        def owned(x): return x["userId"] == str(self.user_1.id)
        def not_owned(x): return x["userId"] != str(self.user_1.id)

        a = list(filter(owned, resp["data"]["allStyleGuidelines"]["styleGuidelines"]))
        [self.assertEqual(r["promptText"], "test prompt") for r in a]

        b = list(filter(not_owned, resp["data"]["allStyleGuidelines"]["styleGuidelines"]))
        [self.assertIsNone(r["promptText"]) for r in b]

    def test_update_style_guideline__admin_update_style_guideline_defaults(self):
        resp = self.query_admin(mutation_update_style_guideline(
                    id=f'"{self.admin_style_guideline.id}"',
            )
        )
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["name"], "test_style_guideline")
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["promptText"], "test prompt")
        self.assertFalse(resp["data"]["updateStyleGuideline"]["styleGuideline"]["archived"])
        self.assertFalse(resp["data"]["updateStyleGuideline"]["styleGuideline"]["isGlobal"])

    def test_update_style_guideline__admin_update_own_style_guideline(self):
        resp = self.query_admin(mutation_update_style_guideline(
                    id=f'"{self.admin_style_guideline.id}"',
                    name='"new_style_guideline"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["name"], "new_style_guideline")
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["promptText"], "new prompt")
        self.assertTrue(resp["data"]["updateStyleGuideline"]["styleGuideline"]["archived"])
        self.assertTrue(resp["data"]["updateStyleGuideline"]["styleGuideline"]["isGlobal"])

    def test_update_style_guideline__admin_update_user_style_guideline(self):
        resp = self.query_admin(mutation_update_style_guideline(
                    id=f'"{self.user_style_guideline.id}"',
                    name='"new_style_guideline"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["name"], "new_style_guideline")
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["promptText"], "new prompt")
        self.assertTrue(resp["data"]["updateStyleGuideline"]["styleGuideline"]["archived"])
        self.assertTrue(resp["data"]["updateStyleGuideline"]["styleGuideline"]["isGlobal"])

    def test_update_style_guideline__user_update_own_style_guideline(self):
        resp = self.query_user_1(mutation_update_style_guideline(
                    id=f'"{self.user_style_guideline.id}"',
                    name='"new_style_guideline"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["name"], "new_style_guideline")
        self.assertEqual(resp["data"]["updateStyleGuideline"]["styleGuideline"]["promptText"], "new prompt")
        self.assertTrue(resp["data"]["updateStyleGuideline"]["styleGuideline"]["archived"])
        self.assertFalse(resp["data"]["updateStyleGuideline"]["styleGuideline"]["isGlobal"])

    def test_update_style_guideline__user_update_admin_style_guideline(self):
        resp = self.query_user_1(mutation_update_style_guideline(
                    id=f'"{self.admin_style_guideline.id}"',
                    name='"new_style_guideline"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Style Guideline not found")
        self.assertIsNone(resp["data"]["updateStyleGuideline"])

    def test_delete_style_guideline__admin_delete_own_style_guideline(self):
        resp = self.query_admin(mutation_delete_style_guideline(
                    id=str(self.admin_style_guideline.id),
            )
        )
        self.assertTrue(resp["data"]["deleteStyleGuideline"])

    def test_delete_style_guideline__admin_delete_user_style_guideline(self):
        resp = self.query_admin(mutation_delete_style_guideline(
                    id=str(self.user_style_guideline.id),
            )
        )
        self.assertTrue(resp["data"]["deleteStyleGuideline"])

    def test_delete_style_guideline__user_delete_own_style_guideline(self):
        resp = self.query_user_1(mutation_delete_style_guideline(
                    id=str(self.user_style_guideline.id),
            )
        )
        self.assertTrue(resp["data"]["deleteStyleGuideline"])

    def test_delete_style_guideline__admin_delete_user_style_guideline(self):
        resp = self.query_user_1(mutation_delete_style_guideline(
                id=str(self.admin_style_guideline.id),
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Style Guideline not found")
        self.assertFalse(resp["data"]["deleteStyleGuideline"])


if __name__ == "__main__":
    unittest.main()
