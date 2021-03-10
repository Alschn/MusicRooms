from django.conf import settings
from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    # use host's username instead of ID
    host = serializers.StringRelatedField(many=False)

    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip', 'created_at')


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')


class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])     # redefine code in serializer

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')


class UserSerializer(serializers.ModelSerializer):
    """might come in handy later, rn not used"""
    class Meta:
        model = settings.AUTH_USER_MODEL
        fields = ('id', 'username', 'email')
