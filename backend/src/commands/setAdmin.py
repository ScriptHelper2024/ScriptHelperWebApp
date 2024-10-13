from main.modules.User.UserModel import UserModel

class SetAdmin:
    command_name = 'setAdmin'

    def run(self, args):
        if len(args) < 1:
            print('No email provided')
            return

        email = args[0]
        user = UserModel.objects(email=email).first()

        if user is None:
            print(f'User with email {email} not found')
            return

        user.update(set__admin_level=1)
        print(f'Admin level for user {email} set to 1')
