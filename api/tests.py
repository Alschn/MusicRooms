import json

from django.test import TestCase
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
)
from rest_framework.test import APIRequestFactory, APIClient

from api.models import User, Room


class MusicRoomsAPIViewsTests(TestCase):
    def setUp(self) -> None:
        self.factory = APIRequestFactory()
        self.client = APIClient()
        self.user = User.objects.create_user(
            'testuser', email='testuser@test.com', password='testing')

    def _require_login_and_auth(self):
        self.client.login(username='testuser', password='testing')
        self.client.force_authenticate(self.user)

    def test_is_not_authenticated(self):
        response = self.client.get(f'/api/get-room')
        self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)

    def test_is_authenticated(self):
        self._require_login_and_auth()
        response = self.client.get(f'/api/get-room')
        self.assertNotEqual(response.status_code, HTTP_401_UNAUTHORIZED)

    def test_get_room_no_code(self):
        self._require_login_and_auth()
        response = self.client.get(f'/api/get-room')
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_get_room_valid_code(self):
        self._require_login_and_auth()
        Room.objects.create(code="szaman", host=self.user, guest_can_pause=False, votes_to_skip=2)
        response = self.client.get(f'/api/get-room?code=szaman')
        self.assertEqual(response.status_code, HTTP_200_OK)

    def test_get_room_invalid_code(self):
        self._require_login_and_auth()
        response = self.client.get(f'/api/get-room?code=xd')
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

    def test_join_room(self):
        pass

    def test_join_room_no_code(self):
        pass

    def test_join_room_invalid_code(self):
        pass

    def test_create_room_already_exists(self):
        pass

    def test_create_room_invalid_data(self):
        pass

    def test_create_room(self):
        pass

    def test_leave_room_no_code(self):
        pass

    def test_leave_room_when_host(self):
        pass

    def test_leave_room_when_guest(self):
        pass

    def test_leave_wrong_room(self):
        pass

    def test_leave_room_does_not_exist(self):
        pass

    def test_update_room_not_found(self):
        pass

    def test_update_room_not_host(self):
        pass

    def test_update_room_invalid_data(self):
        pass

    def test_update_room(self):
        pass

    def test_user_in_room(self):
        pass

    def test_user_not_in_room(self):
        pass

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
