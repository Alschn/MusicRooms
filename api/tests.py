import json

from django.test import TestCase
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
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
        self.other_user = User.objects.create_user(
            'testuser2', email='testuser2@test.com', password='testing123')
        self.test_room = Room.objects.create(code="test", host=self.user, guest_can_pause=False, votes_to_skip=2)

    def _require_login_and_auth(self, other_user=False):
        if not other_user:
            self.client.login(username='testuser', password='testing')
            self.client.force_authenticate(self.user)
        else:
            self.client.login(username='testuser2', password='testing123')
            self.client.force_authenticate(self.other_user)

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

    def test_get_room_invalid_code(self):
        self._require_login_and_auth()
        response = self.client.get(f'/api/get-room?code=xd')
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

    def test_get_room_valid_code_but_user_not_in_it(self):
        self._require_login_and_auth()

        response = self.client.get(f'/api/get-room?code=test')
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_get_room_valid_code(self):
        self._require_login_and_auth()
        self.user.room = self.test_room
        self.user.save(update_fields=['room'])
        response = self.client.get(f'/api/get-room?code=test')
        self.assertEqual(response.status_code, HTTP_200_OK)

    def test_join_room_not_exists(self):
        self._require_login_and_auth()
        self.assertFalse(self.user.room)
        response = self.client.post(f'/api/join-room', data={
            'code': 'notfound'
        })
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

    def test_join_room_no_code(self):
        self._require_login_and_auth()
        self.assertFalse(self.user.room)
        response = self.client.post(f'/api/join-room')
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertFalse(self.user.room)

    def test_join_room_but_user_already_in_room(self):
        self._require_login_and_auth()

        old_room = self.test_room
        self.user.room = old_room
        self.user.save(update_fields=['room'])

        self.assertEqual(self.user.room, old_room)
        new_room = Room.objects.create(code="test2", host=self.other_user, guest_can_pause=True, votes_to_skip=5)
        response = self.client.post(f'/api/join-room', {
            'code': 'test2'
        })
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)
        self.assertNotEqual(self.user.room, new_room)

    def test_join_room(self):
        self._require_login_and_auth()
        self.assertFalse(self.user.room)
        new_room = Room.objects.create(code="new", host=self.user, guest_can_pause=False, votes_to_skip=2)
        response = self.client.post(f'/api/join-room', data={
            'code': "new"
        })
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(self.user.room, new_room)

    def test_create_room_invalid_data(self):
        self._require_login_and_auth()
        response = self.client.post(f'/api/create-room', data={
            "votes_to_skip": -1,
            "guest_can_pause": True,
        })
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_create_room_but_user_is_already_host(self):
        self._require_login_and_auth()
        response = self.client.post(f'/api/create-room', data={
            "votes_to_skip": 5,
            "guest_can_pause": True,
        })
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_create_room_user_not_host(self):
        self._require_login_and_auth(other_user=True)
        self.assertFalse(self.other_user.room)

        response = self.client.post(f'/api/create-room', data={
            "votes_to_skip": 5,
            "guest_can_pause": True,
        })
        new_room = Room.objects.filter(host=self.other_user)
        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertTrue(new_room.exists())
        self.assertEqual(new_room[0].votes_to_skip, 5)
        self.assertEqual(new_room[0].guest_can_pause, True)

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

    def test_update_room_not_host(self):
        self._require_login_and_auth(other_user=True)
        response = self.client.patch(f'/api/update-room', data={
            "votes_to_skip": 10,
            "guest_can_pause": True,
            "code": 'test'
        })
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_update_room_which_does_not_exist(self):
        self._require_login_and_auth()
        response = self.client.patch(f'/api/update-room', data={
            "votes_to_skip": 4,
            "guest_can_pause": True,
            "code": 'testXD'
        })
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

    def test_update_room_invalid_data(self):
        # Data is checked first, checking if there is room with given code comes later
        self._require_login_and_auth()
        response = self.client.patch(f'/api/update-room', data={
            "votes_to_skip": 0,
            "guest_can_pause": True,
            "code": 'testXD'
        })
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_update_room(self):
        self._require_login_and_auth()
        self.assertEqual(self.test_room.votes_to_skip, 2)
        self.assertEqual(self.test_room.guest_can_pause, False)
        response = self.client.patch(f'/api/update-room', data={
            "votes_to_skip": 3,
            "guest_can_pause": True,
            "code": 'test'
        })
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.test_room.refresh_from_db()
        self.assertEqual(self.test_room.votes_to_skip, 3)
        self.assertEqual(self.test_room.guest_can_pause, True)

    def test_user_in_room(self):
        self._require_login_and_auth()
        self.user.room = self.test_room
        self.user.save(update_fields=['room'])
        response = self.client.get(f'/api/user-in-room')
        json_object = json.loads(response.content)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(json_object['code'], self.test_room.code)

    def test_user_not_in_room(self):
        self._require_login_and_auth()
        response = self.client.get(f'/api/user-in-room')
        self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)

    def test_all_rooms_view(self):
        room2 = Room.objects.create(code="XDXDXDXD", host=self.user, guest_can_pause=True, votes_to_skip=3)

        response = self.client.get("/api/room")
        self.assertEqual(response.status_code, HTTP_200_OK)

        json_object = json.loads(response.content)
        json_room1, json_room2 = json_object
        expected_room1 = Room.objects.get(code=json_room1['code'])
        expected_room2 = Room.objects.get(code=json_room2['code'])
        self.assertEqual(self.test_room, expected_room1)
        self.assertEqual(room2, expected_room2)
        self.assertListEqual([self.test_room, room2], list(Room.objects.all()))
