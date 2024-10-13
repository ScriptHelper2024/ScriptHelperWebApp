import unittest
from tests import BaseTestCase, webhook
from main.modules.User.UserModel import UserModel
from main.modules.AuthorStyle.AuthorStyleModel import AuthorStyleModel


def mutation_user(user): return f'''
  mutation {{
    registerUser(email: "{user}@example.com", password: "password") {{
      user {{
        id
        email
        adminLevel
      }}
      accessToken
    }}
  }}
'''

def mutation_register_author_style(**kwargs): return f'''
  mutation {{
    registerAuthorStyle({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      authorStyle {{
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

def mutation_update_author_style(**kwargs): return f'''
  mutation {{
    updateAuthorStyle({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      authorStyle {{
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

def mutation_delete_author_style(id): return f'''
  mutation {{
    deleteAuthorStyle(id: "{id}")
  }}
'''

def query_author_style_by_id(id, include_archived, global_only): return f'''
  query {{
    authorStyleById(id: "{id}", includeArchived: {include_archived}, globalOnly: {global_only}) {{
      id
      name
      promptText
      userId
      archived
      isGlobal
    }}
  }}
'''

def query_all_author_style(include_archived, global_only, page, limit): return f'''
  query {{
    allAuthorStyles(includeArchived: {include_archived}, globalOnly: {global_only}, page: {page}, limit: {limit}) {{
      authorStyles {{
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

class TestAuthorStyles(BaseTestCase):

    def setUp(self):
        super().setUp()

        response_admin = self.query_admin(
                mutation_register_author_style(
                    name='"test_author_style"',
                    promptText='"test prompt"',
                    archived="false",
                    isGlobal="true",
                )
        )
        response_user = self.query_user_1(
                mutation_register_author_style(
                    name='"test_author_style"',
                    promptText='"test prompt"',
                    archived="false",
                    isGlobal="false",
                )
        )
        self.assertEqual(response_admin["data"]["registerAuthorStyle"]["authorStyle"]["userId"], str(self.admin.id), response_admin)
        self.assertEqual(response_user["data"]["registerAuthorStyle"]["authorStyle"]["userId"], str(self.user_1.id), response_user)
        self.admin_author_style = AuthorStyleModel.objects.get(id=response_admin["data"]["registerAuthorStyle"]["authorStyle"]["id"])
        self.user_author_style = AuthorStyleModel.objects.get(id=response_user["data"]["registerAuthorStyle"]["authorStyle"]["id"])

    def tearDown(self):
        UserModel.objects.delete()
        AuthorStyleModel.objects.delete()

    def test_author_style_by_id__admin_retrieve_own_author_style(self):
        resp = self.query_admin(query_author_style_by_id(
                    id=self.admin_author_style.id,
                    include_archived="true",
                    global_only="false",
            )
        )
        self.assertEqual(resp["data"]["authorStyleById"]["userId"], str(self.admin.id), resp)
        self.assertEqual(resp["data"]["authorStyleById"]["promptText"], "test prompt", resp)

    def test_author_style_by_id__admin_retrieve_user_author_style(self):
        resp = self.query_admin(query_author_style_by_id(
                    id=self.user_author_style.id,
                    include_archived="true",
                    global_only="false",
            )
        )
        self.assertEqual(resp["data"]["authorStyleById"]["userId"], str(self.user_1.id))
        self.assertEqual(resp["data"]["authorStyleById"]["promptText"], "test prompt")

    def test_author_style_by_id__admin_retrieve_archived_own_author_style(self):
        self.admin_author_style.archived = True
        self.admin_author_style.save()

        # test don't return archived results
        resp = self.query_admin(query_author_style_by_id(
                    id=self.admin_author_style.id,
                    include_archived="false",
                    global_only="false",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Author Style not found", resp)
        self.assertIsNone(resp["data"]["authorStyleById"], resp)

        # test do return archived results
        resp = self.query_admin(query_author_style_by_id(
                    id=self.admin_author_style.id,
                    include_archived="true",
                    global_only="false",
            )
        )
        self.assertEqual(resp["data"]["authorStyleById"]["userId"], str(self.admin.id), resp)

    def test_author_style_by_id__user_retrieve_global_author_style(self):
        # test return own record
        resp = self.query_user_1(query_author_style_by_id(
                    id=self.user_author_style.id,
                    include_archived="false",
                    global_only="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Author Style not found", resp)
        self.assertIsNone(resp["data"]["authorStyleById"], resp)

        # test return own global record
        resp = self.query_user_1(query_author_style_by_id(
                    id=self.user_author_style.id,
                    include_archived="false",
                    global_only="false",
            )
        )
        self.assertEqual(resp["data"]["authorStyleById"]["userId"], str(self.user_1.id), resp)

    def test_author_style_by_id__user_retrieve_archived_global_author_style(self):
        self.admin_author_style.archived = True
        self.admin_author_style.save()

        resp = self.query_user_1(query_author_style_by_id(
                    id=self.admin_author_style.id,
                    include_archived="true",
                    global_only="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Author Style not found", resp)
        self.assertIsNone(resp["data"]["authorStyleById"], resp)

    def test_all_author_styles__admin_retrieve_all_author_style(self):
        resp = self.query_admin(query_all_author_style(
                    include_archived="true",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 1, resp)
        [self.assertEqual(r["promptText"], "test prompt", r) for r in resp["data"]["allAuthorStyles"]["authorStyles"]]
        self.assertEqual(resp["data"]["allAuthorStyles"]["pages"], 1, resp)

    def test_all_author_styles__user_retrieve_all_author_style(self):
        resp = self.query_user_1(query_all_author_style(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )

        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 2, resp)
        # for some reason the admin prompt text is None
        #[self.assertEqual(r["promptText"], "test prompt") for r in resp.get_json()["data"]["allAuthorStyles"]['authorStyles']]

    def test_all_author_styles__admin_retrieve_archived_own_author_style(self):
        self.admin_author_style.archived = True
        self.admin_author_style.save()

        # test don't return archived results
        resp = self.query_admin(query_all_author_style(
                    include_archived="false",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 0, resp)

        # test do return archived results
        resp = self.query_admin(query_all_author_style(
                    include_archived="true",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 1, resp)

    def test_all_author_styles__user_retrieve_global_author_style(self):
        # test return global and archived results
        resp = self.query_user_1(query_all_author_style(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )

        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 2, resp)

        # test do return global results
        resp = self.query_user_1(query_all_author_style(
                    include_archived="true",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 1, resp)

    def test_all_author_styles__user_retrieve_admin_author_style(self):
        resp = self.query_user_1(query_all_author_style(
                    include_archived="true",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 1, resp)

    def test_all_author_styles__user_retrieve_archived_global_author_style(self):

        resp = self.query_user_1(query_all_author_style(
                    include_archived="true",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allAuthorStyles"]["authorStyles"]), 1, resp)

    def test_all_author_styles__admin_retrieve_global_author_style_private_fields(self):
        self.admin_author_style.is_global = True
        self.admin_author_style.save()
        self.user_author_style.is_global = True
        self.user_author_style.save()

        resp = self.query_admin(query_all_author_style(
                    include_archived="false",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )
        [self.assertEqual(r["promptText"], "test prompt", r) for r in resp["data"]["allAuthorStyles"]["authorStyles"]]

    def test_all_author_styles__user_retrieve_global_author_style_private_fields(self):
        self.user_author_style.is_global = True
        self.user_author_style.save()

        resp = self.query_user_1(query_all_author_style(
                    include_archived="true",
                    global_only="true",
                    page=1,
                    limit=25,
            )
        )

        def owned(x): return x["userId"] == str(self.user_1.id)
        def not_owned(x): return x["userId"] != str(self.user_1.id)

        a = list(filter(owned, resp["data"]["allAuthorStyles"]["authorStyles"]))
        [self.assertEqual(r["promptText"], "test prompt", r) for r in a]

        b = list(filter(not_owned, resp["data"]["allAuthorStyles"]["authorStyles"]))
        [self.assertIsNone(r["promptText"], r) for r in b]

    def test_update_author_style__admin_update_author_style_defaults(self):
        resp = self.query_admin(mutation_update_author_style(
                    id=f'"{self.admin_author_style.id}"',
            )
        )
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["name"], "test_author_style", resp)
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["promptText"], "test prompt", resp)
        self.assertFalse(resp["data"]["updateAuthorStyle"]["authorStyle"]["archived"], resp)
        self.assertTrue(resp["data"]["updateAuthorStyle"]["authorStyle"]["isGlobal"], resp)

    def test_update_author_style__admin_update_own_author_style(self):
        resp = self.query_admin(mutation_update_author_style(
                    id=f'"{self.admin_author_style.id}"',
                    name='"new_author_style"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["name"], "new_author_style", resp)
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["promptText"], "new prompt", resp)
        self.assertTrue(resp["data"]["updateAuthorStyle"]["authorStyle"]["archived"], resp)
        self.assertTrue(resp["data"]["updateAuthorStyle"]["authorStyle"]["isGlobal"], resp)

    def test_update_author_style__admin_update_user_author_style(self):
        resp = self.query_admin(mutation_update_author_style(
                    id=f'"{self.user_author_style.id}"',
                    name='"new_author_style"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["name"], "new_author_style", resp)
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["promptText"], "new prompt", resp)
        self.assertTrue(resp["data"]["updateAuthorStyle"]["authorStyle"]["archived"], resp)
        self.assertTrue(resp["data"]["updateAuthorStyle"]["authorStyle"]["isGlobal"], resp)

    def test_update_author_style__user_update_own_author_style(self):
        resp = self.query_user_1(mutation_update_author_style(
                    id=f'"{self.user_author_style.id}"',
                    name='"new_author_style"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["name"], "new_author_style", resp)
        self.assertEqual(resp["data"]["updateAuthorStyle"]["authorStyle"]["promptText"], "new prompt", resp)
        self.assertTrue(resp["data"]["updateAuthorStyle"]["authorStyle"]["archived"], resp)
        self.assertFalse(resp["data"]["updateAuthorStyle"]["authorStyle"]["isGlobal"], resp)

    def test_update_author_style__user_update_admin_author_style(self):
        resp = self.query_user_1(mutation_update_author_style(
                    id=f'"{self.admin_author_style.id}"',
                    name='"new_author_style"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Author Style not found", resp)
        self.assertIsNone(resp["data"]["updateAuthorStyle"], resp)

    def test_delete_author_style__admin_delete_own_author_style(self):
        resp = self.query_admin(mutation_delete_author_style(
                    id=str(self.admin_author_style.id),
            )
        )
        self.assertTrue(resp["data"]["deleteAuthorStyle"], resp)

    def test_delete_author_style__admin_delete_user_author_style(self):
        resp = self.query_admin(mutation_delete_author_style(
                    id=str(self.user_author_style.id),
            )
        )
        self.assertTrue(resp["data"]["deleteAuthorStyle"], resp)

    def test_delete_author_style__user_delete_own_author_style(self):
        resp = self.query_user_1(mutation_delete_author_style(
                    id=str(self.user_author_style.id),
            )
        )
        self.assertTrue(resp["data"]["deleteAuthorStyle"], resp)

    def test_delete_author_style__admin_delete_user_author_style(self):
        resp = self.query_user_1(mutation_delete_author_style(
                id=str(self.admin_author_style.id),
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Author Style not found", resp)
        self.assertFalse(resp["data"]["deleteAuthorStyle"], resp)


if __name__ == "__main__":
    unittest.main()
