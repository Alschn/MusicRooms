from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
import json


class RoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'rooms_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):     # server receives message
        print("Received: " + text_data)
        text_data_json = json.loads(text_data)
        message = text_data_json['text']
        user = text_data_json['user']
        timestamp = text_data_json['time']

        await self.channel_layer.group_send(    # server alerts every user inside the group
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


    async def song_changed(self, event):
        """
        Host sends message that his web player sdk changed state
        All users fetch that state and synchronize their player
        """
        song_id = event['song']

        await self.send(text_data=json.dumps({
            'song_id': song_id,
            'changed_by': 'host',
        }))

    async def fetch_current_song(self, event):
        pass
