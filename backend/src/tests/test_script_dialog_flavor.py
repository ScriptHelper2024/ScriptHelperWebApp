import unittest
from tests import BaseTestCase
from main.modules.User.UserModel import UserModel
from main.modules.ScriptDialogFlavor.ScriptDialogFlavorModel import ScriptDialogFlavorModel


def mutation_register_script_dialog_flavor(**kwargs): return f'''
  mutation {{
    registerScriptDialogFlavor({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      scriptDialogFlavor {{
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

def mutation_update_script_dialog_flavor(**kwargs): return f'''
  mutation {{
    updateScriptDialogFlavor({', '.join([f'{k}:{v}' for k, v in kwargs.items()])}) {{
      scriptDialogFlavor {{
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

def mutation_delete_script_dialog_flavor(id): return f'''
  mutation {{
    deleteScriptDialogFlavor(id: "{id}")
  }}
'''

def query_script_dialog_flavor_by_id(id, include_archived, include_global): return f'''
  query {{
    scriptDialogFlavorById(id: "{id}", includeArchived: {include_archived}, includeGlobal: {include_global}) {{
      id
      name
      promptText
      userId
      archived
      isGlobal
    }}
  }}
'''

def query_all_script_dialog_flavor(include_archived, global_only, page, limit): return f'''
  query {{
    allScriptDialogFlavors(includeArchived: {include_archived}, globalOnly: {global_only}, page: {page}, limit: {limit}) {{
      scriptDialogFlavors {{
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

class TestScriptDialogFlavors(BaseTestCase):

    def setUp(self):
        super().setUp()

        response_admin = self.query_admin(
                mutation_register_script_dialog_flavor(
                    name='"test_script_dialog_flavor"',
                    promptText='"test prompt"',
                    archived="false",
                    isGlobal="false",
                )
        )
        response_user = self.query_user_1(
                mutation_register_script_dialog_flavor(
                    name='"test_script_dialog_flavor"',
                    promptText='"test prompt"',
                    archived="false",
                    isGlobal="false",
                )
        )
        self.assertEqual(response_admin["data"]["registerScriptDialogFlavor"]["scriptDialogFlavor"]["userId"], str(self.admin.id))
        self.assertEqual(response_user["data"]["registerScriptDialogFlavor"]["scriptDialogFlavor"]["userId"], str(self.user_1.id))
        self.admin_script_dialog_flavor = ScriptDialogFlavorModel.objects.get(id=response_admin["data"]["registerScriptDialogFlavor"]["scriptDialogFlavor"]["id"])
        self.user_script_dialog_flavor = ScriptDialogFlavorModel.objects.get(id=response_user["data"]["registerScriptDialogFlavor"]["scriptDialogFlavor"]["id"])

    def tearDown(self):
        super().tearDown()
        ScriptDialogFlavorModel.objects.delete()

    def test_script_dialog_flavor_by_id__admin_retrieve_own_script_dialog_flavor(self):
        resp = self.query_admin(query_script_dialog_flavor_by_id(
                    id=self.admin_script_dialog_flavor.id,
                    include_archived="false",
                    include_global="false",
            )
        )
        self.assertEqual(resp["data"]["scriptDialogFlavorById"]["userId"], str(self.admin.id))
        self.assertEqual(resp["data"]["scriptDialogFlavorById"]["promptText"], "test prompt")

    def test_script_dialog_flavor_by_id__admin_retrieve_user_script_dialog_flavor(self):
        resp = self.query_admin(query_script_dialog_flavor_by_id(
                    id=self.user_script_dialog_flavor.id,
                    include_archived="false",
                    include_global="false",
            )
        )
        self.assertEqual(resp["data"]["scriptDialogFlavorById"]["userId"], str(self.user_1.id))
        self.assertEqual(resp["data"]["scriptDialogFlavorById"]["promptText"], "test prompt")

    def test_script_dialog_flavor_by_id__admin_retrieve_archived_own_script_dialog_flavor(self):
        self.admin_script_dialog_flavor.archived = True
        self.admin_script_dialog_flavor.is_global = True
        self.admin_script_dialog_flavor.save()

        # test don't return archived results
        resp = self.query_admin(query_script_dialog_flavor_by_id(
                    id=self.admin_script_dialog_flavor.id,
                    include_archived="false",
                    include_global="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Script Dialog Flavor not found")
        self.assertIsNone(resp["data"]["scriptDialogFlavorById"])

        # test do return archived results
        resp = self.query_admin(query_script_dialog_flavor_by_id(
                    id=self.admin_script_dialog_flavor.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["data"]["scriptDialogFlavorById"]["userId"], str(self.admin.id))

    def test_script_dialog_flavor_by_id__user_retrieve_global_script_dialog_flavor(self):
        self.admin_script_dialog_flavor.is_global = True
        self.admin_script_dialog_flavor.save()

        # test don't return global results
        resp = self.query_user_1(query_script_dialog_flavor_by_id(
                    id=self.admin_script_dialog_flavor.id,
                    include_archived="false",
                    include_global="false",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Script Dialog Flavor not found")
        self.assertIsNone(resp["data"]["scriptDialogFlavorById"])

        # test do return global results
        resp = self.query_user_1(query_script_dialog_flavor_by_id(
                    id=self.admin_script_dialog_flavor.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["data"]["scriptDialogFlavorById"]["userId"], str(self.admin.id))
        self.assertIsNone(resp["data"]["scriptDialogFlavorById"]["promptText"])

    def test_script_dialog_flavor_by_id__user_retrieve_archived_global_script_dialog_flavor(self):
        self.admin_script_dialog_flavor.archived = True
        self.admin_script_dialog_flavor.is_global = True
        self.admin_script_dialog_flavor.save()

        resp = self.query_user_1(query_script_dialog_flavor_by_id(
                    id=self.admin_script_dialog_flavor.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Script Dialog Flavor not found")
        self.assertIsNone(resp["data"]["scriptDialogFlavorById"])

    def test_script_dialog_flavor_by_id__user_retrieve_admin_script_dialog_flavor(self):
        resp = self.query_user_1(query_script_dialog_flavor_by_id(
                    id=self.admin_script_dialog_flavor.id,
                    include_archived="true",
                    include_global="true",
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Script Dialog Flavor not found")
        self.assertIsNone(resp["data"]["scriptDialogFlavorById"])

    def test_all_script_dialog_flavors__admin_retrieve_all_script_dialog_flavor(self):
        resp = self.query_admin(query_all_script_dialog_flavor(
                    include_archived="true",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 2)
        [self.assertEqual(r["promptText"], "test prompt") for r in resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]]
        self.assertEqual(resp["data"]["allScriptDialogFlavors"]["pages"], 1)

    def test_all_script_dialog_flavors__user_retrieve_all_script_dialog_flavor(self):
       resp = self.query_user_1(query_all_script_dialog_flavor(
                   include_archived="true",
                   global_only="false",
                   page=1,
                   limit=25,
       ))
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 1)
       [self.assertEqual(r["promptText"], "test prompt") for r in resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]]

    def test_all_script_dialog_flavors__admin_retrieve_archived_own_script_dialog_flavor(self):
       self.admin_script_dialog_flavor.archived = True
       self.admin_script_dialog_flavor.is_global = True
       self.admin_script_dialog_flavor.save()

       # test don't return archived results
       resp = self.query_admin(query_all_script_dialog_flavor(
                   include_archived="false",
                   global_only="false",
                   page=1,
                   limit=25,
           )
       )
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 1)

       # test do return archived results
       resp = self.query_admin(query_all_script_dialog_flavor(
                   include_archived="true",
                   global_only="false",
                   page=1,
                   limit=25,
           )
       )
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 2)

    def test_all_script_dialog_flavors__user_only_retrieve_global_script_dialog_flavor(self):
       self.admin_script_dialog_flavor.is_global = True
       self.admin_script_dialog_flavor.save()

       # test return all results
       resp = self.query_user_1(query_all_script_dialog_flavor(
                   include_archived="true",
                   global_only="false",
                   page=1,
                   limit=25,
           )
       )
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 2)

       # test only return global results
       resp = self.query_user_1(query_all_script_dialog_flavor(
                   include_archived="true",
                   global_only="true",
                   page=1,
                   limit=25,
           )
       )
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 1)

    def test_all_script_dialog_flavors__user_retrieve_admin_script_dialog_flavor(self):
       resp = self.query_user_1(query_all_script_dialog_flavor(
                   include_archived="true",
                   global_only="false",
                   page=1,
                   limit=25,
           )
       )
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 1)

    def test_all_script_dialog_flavors__user_retrieve_archived_global_script_dialog_flavor(self):
       self.admin_script_dialog_flavor.is_global = True
       self.admin_script_dialog_flavor.save()

       resp = self.query_user_1(query_all_script_dialog_flavor(
                   include_archived="true",
                   global_only="false",
                   page=1,
                   limit=25,
           )
       )
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 2)

       self.admin_script_dialog_flavor.archived = True
       self.admin_script_dialog_flavor.save()

       resp = self.query_user_1(query_all_script_dialog_flavor(
                   include_archived="true",
                   global_only="false",
                   page=1,
                   limit=25,
           )
       )
       self.assertEqual(len(resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]), 1)

    def test_all_script_dialog_flavors__admin_retrieve_global_script_dialog_flavor_private_fields(self):
        self.admin_script_dialog_flavor.is_global = True
        self.admin_script_dialog_flavor.save()
        self.user_script_dialog_flavor.is_global = True
        self.user_script_dialog_flavor.save()

        resp = self.query_admin(query_all_script_dialog_flavor(
                    include_archived="false",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )
        [self.assertEqual(r["promptText"], "test prompt") for r in resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]]

    def test_all_script_dialog_flavors__user_retrieve_global_script_dialog_flavor_private_fields(self):
        self.admin_script_dialog_flavor.is_global = True
        self.admin_script_dialog_flavor.save()
        self.user_script_dialog_flavor.is_global = True
        self.user_script_dialog_flavor.save()

        resp = self.query_user_1(query_all_script_dialog_flavor(
                    include_archived="false",
                    global_only="false",
                    page=1,
                    limit=25,
            )
        )

        def owned(x): return x["userId"] == str(self.user_1.id)
        def not_owned(x): return x["userId"] != str(self.user_1.id)

        a = list(filter(owned, resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]))
        [self.assertEqual(r["promptText"], "test prompt") for r in a]

        b = list(filter(not_owned, resp["data"]["allScriptDialogFlavors"]["scriptDialogFlavors"]))
        [self.assertIsNone(r["promptText"]) for r in b]

    def test_update_script_dialog_flavor__admin_update_script_dialog_flavor_defaults(self):
        resp = self.query_admin(mutation_update_script_dialog_flavor(
                    id=f'"{self.admin_script_dialog_flavor.id}"',
            )
        )
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["name"], "test_script_dialog_flavor")
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["promptText"], "test prompt")
        self.assertFalse(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["archived"])
        self.assertFalse(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["isGlobal"])

    def test_update_script_dialog_flavor__admin_update_own_script_dialog_flavor(self):
        resp = self.query_admin(mutation_update_script_dialog_flavor(
                    id=f'"{self.admin_script_dialog_flavor.id}"',
                    name='"new_script_dialog_flavor"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["name"], "new_script_dialog_flavor")
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["promptText"], "new prompt")
        self.assertTrue(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["archived"])
        self.assertTrue(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["isGlobal"])

    def test_update_script_dialog_flavor__admin_update_user_script_dialog_flavor(self):
        resp = self.query_admin(mutation_update_script_dialog_flavor(
                    id=f'"{self.user_script_dialog_flavor.id}"',
                    name='"new_script_dialog_flavor"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["name"], "new_script_dialog_flavor")
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["promptText"], "new prompt")
        self.assertTrue(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["archived"])
        self.assertTrue(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["isGlobal"])

    def test_update_script_dialog_flavor__user_update_own_script_dialog_flavor(self):
        resp = self.query_user_1(mutation_update_script_dialog_flavor(
                    id=f'"{self.user_script_dialog_flavor.id}"',
                    name='"new_script_dialog_flavor"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["name"], "new_script_dialog_flavor")
        self.assertEqual(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["promptText"], "new prompt")
        self.assertTrue(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["archived"])
        self.assertFalse(resp["data"]["updateScriptDialogFlavor"]["scriptDialogFlavor"]["isGlobal"])

    def test_update_script_dialog_flavor__user_update_admin_script_dialog_flavor(self):
        resp = self.query_user_1(mutation_update_script_dialog_flavor(
                    id=f'"{self.admin_script_dialog_flavor.id}"',
                    name='"new_script_dialog_flavor"',
                    promptText='"new prompt"',
                    archived='true',
                    isGlobal='true',
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Script Dialog Flavor not found")
        self.assertIsNone(resp["data"]["updateScriptDialogFlavor"])

    def test_delete_script_dialog_flavor__admin_delete_own_script_dialog_flavor(self):
        resp = self.query_admin(mutation_delete_script_dialog_flavor(
                    id=str(self.admin_script_dialog_flavor.id),
            )
        )
        self.assertTrue(resp["data"]["deleteScriptDialogFlavor"])

    def test_delete_script_dialog_flavor__admin_delete_user_script_dialog_flavor(self):
        resp = self.query_admin(mutation_delete_script_dialog_flavor(
                    id=str(self.user_script_dialog_flavor.id),
            )
        )
        self.assertTrue(resp["data"]["deleteScriptDialogFlavor"])

    def test_delete_script_dialog_flavor__user_delete_own_script_dialog_flavor(self):
        resp = self.query_user_1(mutation_delete_script_dialog_flavor(
                    id=str(self.user_script_dialog_flavor.id),
            )
        )
        self.assertTrue(resp["data"]["deleteScriptDialogFlavor"])

    def test_delete_script_dialog_flavor__admin_delete_user_script_dialog_flavor(self):
        resp = self.query_user_1(mutation_delete_script_dialog_flavor(
                id=str(self.admin_script_dialog_flavor.id),
            )
        )
        self.assertEqual(resp["errors"][0]["message"], "Script Dialog Flavor not found")
        self.assertFalse(resp["data"]["deleteScriptDialogFlavor"])


if __name__ == "__main__":
    unittest.main()
