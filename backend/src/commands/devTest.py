from main.libraries.functions import *
from textwrap import dedent
from main.libraries.Cache import Cache
from main.modules.Admin.AdminService import AdminService

class DevText:
    command_name = 'devTest'

    def run(self, args):

        test_key = 'test_key'
        test_value = 'value123'

        print(AdminService.get_platform_statistics())

        #Cache().set(test_key, test_value)
        print(Cache().get(test_key))

        return
