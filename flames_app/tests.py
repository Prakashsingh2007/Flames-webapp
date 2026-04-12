from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase


User = get_user_model()


class FlamesApiTests(APITestCase):
	def test_flames_calculation_returns_explanation_and_steps(self):
		response = self.client.post(
			"/api/flames/",
			{"name1": "Alice", "name2": "Bob"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("relationship", response.data)
		self.assertIn("explanation", response.data)
		self.assertIn("elimination_steps", response.data)
		self.assertTrue(isinstance(response.data["elimination_steps"], list))

	def test_flames_rejects_empty_input(self):
		response = self.client.post(
			"/api/flames/",
			{"name1": "", "name2": "Bob"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_flames_rejects_non_alphabetic_names(self):
		response = self.client.post(
			"/api/flames/",
			{"name1": "12345", "name2": "%%%%"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("error", response.data)

	def test_history_endpoint_returns_saved_results(self):
		self.client.post(
			"/api/flames/",
			{"name1": "Sam", "name2": "Jules"},
			format="json",
		)
		self.client.post(
			"/api/flames/",
			{"name1": "Ria", "name2": "Dev"},
			format="json",
		)

		response = self.client.get("/api/flames/history/?limit=5")
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("count", response.data)
		self.assertIn("results", response.data)
		self.assertGreaterEqual(response.data["count"], 2)


class PersonalHistoryTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username="tester", password="strongpass123")
		self.token = Token.objects.create(user=self.user)
		self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

	def test_authenticated_result_saved_for_user(self):
		create_response = self.client.post(
			"/api/flames/",
			{"name1": "Arun", "name2": "Maya"},
			format="json",
		)
		self.assertEqual(create_response.status_code, status.HTTP_200_OK)
		self.assertTrue(create_response.data["owned_by_authenticated_user"])

		history_response = self.client.get("/api/flames/my-results/")
		self.assertEqual(history_response.status_code, status.HTTP_200_OK)
		self.assertGreaterEqual(len(history_response.data), 1)
