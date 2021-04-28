from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.spotify.views import SpotifyOAuth2Adapter
from django.shortcuts import redirect
from rest_auth.registration.serializers import SocialLoginSerializer
from rest_auth.registration.views import SocialLoginView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from spotify_api.models import Vote
from .utils import (
    execute_spotify_api_call,
    pause_song,
    play_song,
    skip_song, set_volume, prev_song, search_for_items, add_to_queue, get_recommendations,
)


class SpotifyLogin(SocialLoginView):
    adapter_class = SpotifyOAuth2Adapter
    serializer_class = SocialLoginSerializer

    # This fixes issue with login view in the latest version of drf
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)


def spotify_callback(request, format=None):
    return redirect('home')  # return to different frontend app


class CurrentSong(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        user = request.user
        room = user.room
        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_400_BAD_REQUEST)

        endpoint = "player/currently-playing"
        response = execute_spotify_api_call(user, endpoint)

        if 'error' in response or 'item' not in response:
            return Response(response, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')  # album > images > first image > its url
        is_playing = response.get('is_playing')
        song_id = item.get('id')
        title = item.get('name')

        artist_str = ""  # multiple artists - own string formatting
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_str += ", "
            name = artist.get('name')
            artist_str += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))  # how many votes does the song have

        song = {
            'title': title,
            'artist': artist_str,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required': room.votes_to_skip,
            'id': song_id,
        }

        self.update_room_song(room, song_id)

        # return custom object instead of everything inside of response
        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room)
            votes.delete()


class PauseSong(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, format=None):
        sender = request.user
        room = sender.room

        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_404_NOT_FOUND)

        if sender == room.host or room.guest_can_pause:
            pause_song(sender)
            return Response({'Success': 'Paused song'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'Error': 'You are not allowed to play a song!'}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, format=None):
        sender = request.user
        room = sender.room

        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_404_NOT_FOUND)

        if sender == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({'Success': 'Playing song'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'Error': 'You are not allowed to play a song!'}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        sender = request.user
        room = sender.room

        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_400_BAD_REQUEST)

        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        voted_needed = room.votes_to_skip

        if sender == room.host or len(votes) + 1 >= voted_needed:
            votes.delete()  # delete last song's votes if we were to skip song
            if request.data['forward'] is False:
                prev_song(sender)
            else:
                skip_song(sender)
            return Response({'Message': 'Skipped song'}, status.HTTP_204_NO_CONTENT)
        else:
            vote = Vote(user=sender, room=room, song_id=room.current_song)
            vote.save()
            return Response({'Message': 'Added skip vote'}, status.HTTP_204_NO_CONTENT)


class SetVolume(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        sender = request.user
        room = sender.room

        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            volume = request.data['volume']
        except KeyError:
            return Response({'Error': 'Volume value not found in request'}, status=status.HTTP_400_BAD_REQUEST)

        if 0 <= volume <= 100:
            set_volume(sender, volume)
            return Response({"Message": f"Changed volume to {volume}"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"Error": 'Invalid volume parameter'}, status=status.HTTP_400_BAD_REQUEST)


class PerformSearch(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user

        if "query" not in request.data or "type" not in request.data:
            return Response({'Error': 'Query or type parameter not found in request'},
                            status=status.HTTP_400_BAD_REQUEST)

        query = request.data['query']
        types = request.data['type']

        response = search_for_items(user=sender, query=query, types=types)
        # do the error handling
        return Response(response, status=status.HTTP_200_OK)


class QueueHandler(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Add tracks to queue """
        sender = request.user

        if "uri" not in request.data:
            return Response({'Error': "Song's uri not found in request"},
                            status=status.HTTP_400_BAD_REQUEST)

        song_uri = request.data['uri']
        response = add_to_queue(user=sender, uri=song_uri)
        # do the error handling

        return Response(response, status=status.HTTP_204_NO_CONTENT)


class GetRecommendations(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user

        if 'seed_tracks' not in request.data:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

        track = str(request.data['seed_tracks'])
        response = get_recommendations(user=sender, track_id=track)
        # handle errors
        return Response(response, status=status.HTTP_200_OK)


class CurrentUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        social_acc = SocialAccount.objects.filter(user=user)
        if social_acc.exists():
            social_acc = social_acc[0]
        else:
            return Response({'Error': 'Social account not found!'}, status=status.HTTP_404_NOT_FOUND)
        data = social_acc.extra_data

        country = data.get('country')
        username = data.get('display_name')
        email = data.get('email')
        followers_count = data.get('followers').get('total')
        url = data.get('href')
        id = data.get('id')
        image = data.get('images')
        if image:
            image_url = image[0].get('url')
        else:
            image_url = None
        product = data.get('product')
        uri = data.get('uri')

        formatted_data = {
            "id": id,
            "user": username,
            "email": email,
            "country": country,
            "followers": followers_count,
            "url": url,
            "uri": uri,
            "image_url": image_url,
            "acc_type": product,
        }

        return Response(formatted_data, status=status.HTTP_200_OK)
