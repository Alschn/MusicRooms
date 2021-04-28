from rest_framework import serializers

from rooms.models import Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('sender', 'room', 'content', 'timestamp')
