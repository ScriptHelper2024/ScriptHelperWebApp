import unittest
from main.app import create_app
from main.config.db import initialize_db

class TestHealthCheck(unittest.TestCase):

    def setUp(self):
        # Mock the database
        mock_db_uri = 'mongodb://localhost'
        self.connection = initialize_db(mock_db_uri, reconnect=True)

        self.app = create_app()
        self.client = self.app.test_client()

    def test_health_check(self):
        query = '''
        query {
            healthCheck {
                status
            }
        }
        '''
        response = self.client.post('/graphql', json={'query': query})
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.get_json(), {"data": {"healthCheck": {"status": "OK"}}})

if __name__ == "__main__":
    unittest.main()
