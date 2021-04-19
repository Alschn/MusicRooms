import json

from django.test import TestCase
from rest_framework.status import HTTP_200_OK
from rest_framework.test import APIRequestFactory, APIClient

from api.models import User, Room


class MusicRoomsAPIViewsTests(TestCase):
    def setUp(self) -> None:
        self.factory = APIRequestFactory()
        self.client = APIClient()
        self.user = User.objects.create_user(
            'testuser', email='testuser@test.com', password='testing')

    def test_all_rooms_view(self):
        room1 = Room.objects.create(code="ABCDEFGH", host=self.user, guest_can_pause=False, votes_to_skip=2)
        room2 = Room.objects.create(code="XDXDXDXD", host=self.user, guest_can_pause=True, votes_to_skip=3)

        response = self.client.get("/api/room")
        self.assertEqual(response.status_code, HTTP_200_OK)

        json_object = json.loads(response.content)
        json_room1 = json_object[0]
        json_room2 = json_object[1]
        expected_room1 = Room.objects.get(code=json_room1['code'])
        expected_room2 = Room.objects.get(code=json_room2['code'])
        self.assertEqual(room1, expected_room1)
        self.assertEqual(room2, expected_room2)
        self.assertListEqual([room1, room2], list(Room.objects.all()))
