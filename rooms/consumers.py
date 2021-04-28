import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from api.models import User, Room
from api.serializers import UserSerializer
from rooms.models import Message
from rooms.serializers import MessageSerializer


class RoomConsumer(AsyncWebsocketConsumer):
    commands = {
        "get_new_message": "get_new_message",
        "fetch_messages": "fetch_messages",
        "request_fetch": "request_fetch",
        "get_current_song": "get_current_song",
        "get_listeners": "get_listeners",
    }

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

    async def receive(self, text_data):
        print("Received: " + text_data)
        text_data_json = json.loads(text_data)

        command = text_data_json.get('command', None)
        if not command:
            return

        # type - event handler
        # params - events

        # to be refactored (right now this code is an overkill)
        if command == 'get_new_message':
            message = text_data_json
            await self.create_new_message(message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': self.commands[text_data_json['command']],
                    'message': message
                }
            )

        elif command == 'fetch_messages':
            # fetch_messages
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': self.commands[text_data_json['command']],
                }
            )

        elif command == 'request_fetch':
            # request_fetch
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': self.commands[text_data_json['command']],
                })

        elif command == 'get_current_song':
            # get_current_song
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': self.commands[text_data_json['command']],
                    'playbackState': text_data_json,
                }
            )

        elif command == "get_listeners":
            # get_listeners
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': self.commands[text_data_json['command']],
                }
            )

    ###################################################
    async def get_listeners(self, event):
        """"Dispatches a list of Users in the current room to the listeners"""
        users = await self.get_users_in_room(code=self.room_name)

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
    async def fetch_messages(self, event):
        """Initially fetches n-last messages and sends them to user."""
        # to do sending message only to one person
        messages = await self.get_messages_in_room(self.room_name)

        await self.send(text_data=json.dumps({
            'messages': messages,
            'command': 'set_fetched_messages'
        }))

    async def get_new_message(self, event):
        """Client sends new chat message.
        Server receives and saves it to database.
        Then server sends it to all users, who will load the message."""
        message = event['message']
        user = message['sender']
        text = message['content']
        time = message['timestamp']

        await self.send(text_data=json.dumps({
            'sender': user,
            'content': text,
            'timestamp': time,
            'command': 'set_new_message'
        }))

    @database_sync_to_async
    def get_users_in_room(self, code):
        room = Room.objects.filter(code=code)
        if room.exists():
            room = room[0]
            qs = User.objects.filter(room=room)
            serialized = UserSerializer(qs, many=True)
            return serialized.data
        return []

    @database_sync_to_async
    def get_messages_in_room(self, code):
        room = Room.objects.filter(code=code)
        if room.exists():
            room = room[0]
            messages = room.get_last_n_messages(n=10)
            serialized = MessageSerializer(messages, many=True)
            return serialized.data
        return []

    @database_sync_to_async
    def create_new_message(self, message):
        user = message['sender']
        text = message['content']
        time = message['timestamp']
        room_code = message['room']
        sender = User.objects.get(id=user)
        room = Room.objects.get(code=room_code)
        Message.objects.create(sender=sender, content=text, timestamp=time, room=room)
