from datetime import timedelta

from allauth.socialaccount.models import SocialAccount, SocialToken
from allauth.socialaccount.providers.spotify.views import SpotifyOAuth2Adapter
from django.utils import timezone
from requests import Request, post
from rest_auth.registration.serializers import SocialLoginSerializer
from rest_auth.registration.views import SocialLoginView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from spotify_api.models import Vote
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from .permissions import HasSpotifyToken
from .utils import (
    execute_spotify_api_call,
    pause_song,
    play_song,
    skip_song,
    set_volume,
    prev_song,
    search_for_items,
    add_to_queue,
    get_recommendations,
    get_user_token,
)

SCOPES = [
    # listening history
    'user-read-recently-played', 'user-top-read', 'user-read-playback-position',
    # spotify connect
    "user-read-playback-state", "user-modify-playback-state", "user-read-currently-playing",
    # playback
    "app-remote-control", "streaming",
    # playlists
    "playlist-modify-public", "playlist-modify-private",
    "playlist-read-private", "playlist-read-collaborative",
    # follow
    "user-follow-modify", "user-follow-read",
    # library
    "user-library-modify", "user-library-read",
    # users
    "user-read-email", "user-read-private",
]


class GetSpotifyAuthURL(APIView):
    """"""

    def get(self, request, *args, **kwargs):
        """Client requests spotify url prepared by the backend."""

        scopes = ' '.join(SCOPES)
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url
        return Response({'url': url}, status=status.HTTP_200_OK)


class GetSpotifyAccessToken(APIView):
    """"""

    def post(self, request):
        """Sends authorization code to Spotify api endpoint.
        Responds with access_token, refresh_token, expires_in, token_type."""
        code = request.data.get('code')

        if not code:
            return Response({'Error': 'Code not found in request'}, status=status.HTTP_400_BAD_REQUEST)

        response = post('https://accounts.spotify.com/api/token', data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        })
        if not response.ok:
            return Response({'error': 'Spotify request failed!'}, status=response.status_code)
        return Response(response.json(), status=status.HTTP_200_OK)


class SpotifyLogin(SocialLoginView):
    """"""
    adapter_class = SpotifyOAuth2Adapter
    serializer_class = SocialLoginSerializer

    def post(self, request, *args, **kwargs):
        res = super(SpotifyLogin, self).post(request, *args, **kwargs)
        access_token = request.data.get("access_token")
        refresh_token = request.data.get("refresh_token")
        expires_in = request.data.get("expires_in")
        if 'key' in res.data:
            token = SocialToken.objects.get(token=access_token)
            token.token_secret = refresh_token
            token.expires_at = timezone.now() + timedelta(seconds=expires_in)
            token.save()
            return Response(res.data, status=status.HTTP_201_CREATED)
        return Response({'Error': "Key was not returned in response"}, status=status.HTTP_404_NOT_FOUND)

    # This fixes issue with login view in the latest version of drf
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)


class GetCurrentSpotifyToken(APIView):
    """api/spotify/token"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def get(self, request, *args, **kwargs):
        # permission granted, it means there is a token
        user = request.user
        token = get_user_token(user)
        return Response({'token': token.token}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def post(self, request, *args, **kwargs):
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
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def put(self, request, *args, **kwargs):
        sender = request.user
        room = sender.room

        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_404_NOT_FOUND)

        if sender == room.host or room.guest_can_pause:
            pause_song(sender)
            return Response({'Success': 'Paused song'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'Error': 'You are not allowed to play a song!'}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def put(self, request, *args, **kwargs):
        sender = request.user
        room = sender.room

        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_404_NOT_FOUND)

        if sender == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({'Success': 'Playing song'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'Error': 'You are not allowed to play a song!'}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def post(self, request, *args, **kwargs):
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
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def put(self, request, *args, **kwargs):
        sender = request.user
        room = sender.room

        if not room:
            return Response({'Error': 'User is not inside of room.'}, status=status.HTTP_403_FORBIDDEN)

        volume = request.data.get('volume')

        if not volume:
            return Response({'Error': 'Volume value not found in request'}, status=status.HTTP_400_BAD_REQUEST)

        if 0 <= volume <= 100:
            set_volume(sender, volume)
            return Response({"Message": f"Changed volume to {volume}"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"Error": 'Invalid volume parameter'}, status=status.HTTP_400_BAD_REQUEST)


class PerformSearch(APIView):
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def post(self, request, *args, **kwargs):
        sender = request.user

        if "query" not in request.data or "type" not in request.data:
            return Response({'Error': 'Query or type parameter not found in request'},
                            status=status.HTTP_400_BAD_REQUEST)

        query = request.data.get('query')
        types = request.data.get('type')

        if 'limit' in request.data and 50 >= request.data['limit'] >= 1:
            limit = request.data['limit']
            response = search_for_items(user=sender, query=query, types=types, limit=limit)
        else:
            response = search_for_items(user=sender, query=query, types=types)
        # do the error handling
        return Response(response, status=status.HTTP_200_OK)


class QueueHandler(APIView):
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def post(self, request, *args, **kwargs):
        """Add tracks to queue """
        sender = request.user
        song_uri = request.data.get('uri')

        if not song_uri:
            return Response({'Error': "Song's uri not found in request"},
                            status=status.HTTP_400_BAD_REQUEST)

        response = add_to_queue(user=sender, uri=song_uri)
        # do the error handling

        return Response(response, status=status.HTTP_204_NO_CONTENT)


class GetRecommendations(APIView):
    """"""
    permission_classes = [IsAuthenticated, HasSpotifyToken]

    def post(self, request, *args, **kwargs):
        sender = request.user
        track = str(request.data['seed_tracks'])

        if not track:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

        if 'limit' in request.data and 100 >= request.data['limit'] >= 1:
            limit = request.data['limit']
            response = get_recommendations(user=sender, track_id=track, limit=limit)
        else:
            response = get_recommendations(user=sender, track_id=track)
        # handle errors
        return Response(response, status=status.HTTP_200_OK)


class CurrentUser(APIView):
    """"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
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
