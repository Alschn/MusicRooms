import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from api.models import User, Room
from api.serializers import UserSerializer


class RoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'rooms_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.send_get_listeners_request_to_group()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):  # server receives message
        print("Received: " + text_data)
        text_data_json = json.loads(text_data)

        if 'text' in text_data_json:
            message = text_data_json['text']
            user = text_data_json['user']
            timestamp = text_data_json['time']

            await self.channel_layer.group_send(  # server alerts every user inside the group
                self.room_group_name,
                {
                    # event handler
                    'type': 'chatroom_message',
                    # event
                    'text': message,
                    'user': user,
                    'time': timestamp,
                }
            )

        elif 'Request' in text_data_json:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'request_fetch',  # event handler
                })

        elif 'track_window' in text_data_json:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'get_current_song',  # event handler
                    'playbackState': text_data_json,  # event
                }
            )
        elif 'get_listeners' in text_data_json:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'get_listeners',  # event handler
                    'code': self.room_name,  # event
                }
            )

    async def get_listeners(self, event):
        """"Dispatches a list of Users in the current room to the listeners"""
        users = await self.get_users_in_room(code=event['code'])

        await self.send(text_data=json.dumps({
            'users': users,
            'command': 'set_listeners'
        }))

    ###################################################

    async def get_current_song(self, event):
        """Dispatches Playback state object received from host
        (client receives payload)"""
        await self.send(text_data=json.dumps({
            'state': event['playbackState'],
            'command': 'set_current_song'
        }))

    async def request_fetch(self, event):
        """
        User requests host's current playback state.
        Host will receive this command and respond with their playback state.
        """
        await self.send(text_data=json.dumps({
            'command': 'send_current_song'
        }))

    ###################################################

    async def chatroom_message(self, event):
        message = event['text']
        user = event['user']
        time = event['time']

        # sends data to every client inside the room
        await self.send(text_data=json.dumps({
            'user': user,
            'text': message,
            'time': time,
            'command': 'new_message'
        }))

    async def send_get_listeners_request_to_group(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'get_listeners',
                'code': self.room_name,
            }
        )

    @database_sync_to_async
    def get_users_in_room(self, code):
        room = Room.objects.filter(code=code)
        if room.exists():
            room = room[0]
            qs = User.objects.filter(room=room)
            serialized = UserSerializer(qs, many=True)
            return serialized.data
        return []
