from cryptography.fernet import Fernet

class GenerateKey:
    command_name = 'generateKey'

    def run(self, args):
        # Generate a Fernet key
        secure_key = Fernet.generate_key()
        print(f'Secure Key: {secure_key.decode()}')
        print('Copy and paste this key into your .env or other configuration files as needed.')

# Example usage within your command system framework
if __name__ == '__main__':
    command = GenerateKey()
    command.run([])
