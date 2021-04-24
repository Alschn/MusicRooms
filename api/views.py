from django.http.response import JsonResponse
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Room
from .serializers import (
    RoomSerializer,
    CreateRoomSerializer,
    UpdateRoomSerializer,
)


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'  # pass a parameter called code

    def get(self, request):
        code = request.GET.get(self.lookup_url_kwarg, None)
        user = request.user
        if code is not None:
            code.rstrip()
            room = Room.objects.filter(code=code)
            if room.exists():
                room = room[0]
                data = RoomSerializer(room).data
                data['is_host'] = user == room.host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'code'

    def post(self, request):
        user = request.user
        code = request.data.get(self.lookup_url_kwarg, None)
        if code is not None:
            room_result = Room.objects.filter(code=code)
            if room_result.exists():
                room = room_result[0]
                user.room = room
                user.save(update_fields=['room'])
                return Response({'Message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Room Code!'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"Bad Request": 'Invalid post data, did not find a code key'},
            status=status.HTTP_400_BAD_REQUEST
        )


class CreateRoomView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateRoomSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = request.user
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                host.room = room
                host.save(update_fields=['room'])
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.room:
            code = user.room.code
            return JsonResponse({'code': code}, status=status.HTTP_200_OK)

        data = {
            'code': False
        }
        return JsonResponse(data=data, status=status.HTTP_204_NO_CONTENT)


class LeaveRoom(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            code = request.data.get('roomCode').rstrip()
        except AttributeError:
            return Response({'Error': 'Code parameter not found'}, status=status.HTTP_400_BAD_REQUEST)
        sender = request.user
        room = Room.objects.filter(code=code)
        if room.exists():
            room = room[0]
            if sender.room == room:
                if sender == room.host:
                    room.delete()
                    return Response({'Message': 'Successfully deleted room!'}, status=status.HTTP_200_OK)
                else:
                    sender.room = None
                    sender.save(update_fields=['room'])
                    return Response({'Message': 'Success! User left the room.'}, status=status.HTTP_200_OK)
            return Response({'Error': 'User is not a participant of this room!'}, status=status.HTTP_403_FORBIDDEN)
        return Response(
            {'Error': 'Did not manage to leave the room. Room not found!'},
            status=status.HTTP_404_NOT_FOUND
        )


class UpdateRoom(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):  # use patch when updating
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'Message': 'Room not found,'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = request.user
            if room.host != user_id:
                return Response({'Message': 'You are not the host of this room,'}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data ...'}, status=status.HTTP_400_BAD_REQUEST)
