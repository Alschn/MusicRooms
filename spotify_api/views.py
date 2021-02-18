from rest_auth.registration.serializers import SocialLoginSerializer
from spotify_api.models import Vote
# from spotify_api.credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from django.shortcuts import redirect
from rest_framework.views import APIView
# from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import (
    execute_spotify_api_call,
    is_spotify_authenticated,
    pause_song,
    play_song, skip_song,
    update_or_create_user_tokens
)
from api.models import Room
from allauth.socialaccount.providers.spotify.views import SpotifyOAuth2Adapter
from rest_auth.registration.views import SocialLoginView
from rest_framework.permissions import IsAuthenticated
from allauth.socialaccount.models import SocialAccount


class SpotifyLogin(SocialLoginView):
    adapter_class = SpotifyOAuth2Adapter
    serializer_class = SocialLoginSerializer

    # This fixes issue with login view in the latest version of drf
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)

#     scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-email user-read-private'

def spotify_callback(request, format=None):
    # code = request.GET.get('code')
    # # error = request.GET.get('error')    # not used
    #
    # response = post('https://accounts.spotify.com/api/token', data={
    #     'grant_type': 'authorization_code',
    #     'code': code,
    #     'redirect_uri': REDIRECT_URI,
    #     'client_id': CLIENT_ID,
    #     'client_secret': CLIENT_SECRET,
    # }).json()
    #
    # access_token = response.get('access_token')
    # token_type = response.get('token_type')
    # refresh_token = response.get('refresh_token')
    # expires_in = response.get('expires_in')
    # error = response.get('error')
    #
    # if not request.session.exists(request.session.session_key):
    #     request.session.create()
    #
    # update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)
    return redirect('home')    # return to different frontend app


# class IsAuthenticated(APIView):
#     def get(self, request, format=None):
#         is_authenticated = is_spotify_authenticated(self.request.session.session_key)
#         return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({'Error': 'User is not inside of the room.'}, status=status.HTTP_404_NOT_FOUND)

        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_call(host, endpoint)

        if 'error' in response or 'item' not in response:
            return Response(response, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')     # album > images > first image > its url
        is_playing = response.get('is_playing')
        song_id = item.get('id')
        title = item.get('name')

        artist_str = ""     # multiple artists - own string formatting
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_str += ", "
            name = artist.get('name')
            artist_str += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))    # how many votes does the song have

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
            votes = Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({'Error': 'User is not inside of the room.'}, status=status.HTTP_404_NOT_FOUND)

        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({'Success': 'Paused song'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'Error': 'You are not allowed to play a song!'}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({'Error': 'User is not inside of the room.'}, status=status.HTTP_404_NOT_FOUND)

        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({'Success': 'Playing song'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'Error': 'You are not allowed to play a song!'}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({'Error': 'User is not inside of the room.'}, status=status.HTTP_404_NOT_FOUND)

        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        voted_needed = room.votes_to_skip

        if self.request.session.session_key == room.host or len(votes) + 1 >= voted_needed:
            votes.delete()  # delete last song's votes if we were to skip song
            skip_song(room.host)
            return Response({'Message': 'Skipped song'}, status.HTTP_204_NO_CONTENT)
        else:
            vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
            vote.save()
            return Response({'Message': 'Added skip vote'}, status.HTTP_204_NO_CONTENT)


class CurrentUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        social_acc = SocialAccount.objects.filter(user=user)
        if social_acc.exists():
            social_acc = social_acc[0]
        else:
            return Response({'Error': 'Social account not found!'}, status=status.HTTP_400_BAD_REQUEST)
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
