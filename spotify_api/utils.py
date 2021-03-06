import json
from datetime import timedelta
from django.contrib.auth.models import User
from .models import SpotifyToken
from django.utils import timezone
from requests import post, get, put
from allauth.socialaccount.models import SocialToken, SocialAccount

BASE_URL = "https://api.spotify.com/v1/"
BASE_URL_ME = "https://api.spotify.com/v1/me/"


def get_user_tokens(user):
    social_acc = SocialAccount.objects.filter(user=user)
    if social_acc.exists():
        account = social_acc[0]
        user_tokens = SocialToken.objects.filter(account=account)
        if user_tokens.exists():
            return user_tokens[0].token
    return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    pass


def is_spotify_authenticated(session_id):
    pass


def refresh_spotify_token(session_id):
    pass


def execute_spotify_api_call(user, endpoint, post_=False, put_=False, other_base_url=None):
    spotify_token = get_user_tokens(user)
    headers = {'Content-Type': 'application/json', 'Authorization': "Bearer " + spotify_token}

    URL = BASE_URL_ME if not other_base_url else other_base_url

    if post_:
        response = post(URL + endpoint, headers=headers)
    elif put_:
        response = put(URL + endpoint, headers=headers)
    else:
        response = get(URL + endpoint, {}, headers=headers)

    # received empty object
    if not response.text:
        return response

    try:
        return response.json()
    except Exception as e:
        return {'Error': f"{e}"}


def play_song(user):
    return execute_spotify_api_call(user, "player/play", put_=True)


def pause_song(user):
    return execute_spotify_api_call(user, "player/pause", put_=True)


def prev_song(user):
    return execute_spotify_api_call(user, "player/previous", post_=True)


def skip_song(user):
    return execute_spotify_api_call(user, "player/next", post_=True)


def set_volume(user, value):
    return execute_spotify_api_call(user, f"player/volume?volume_percent={value}", put_=True)


def search_for_items(user, query, types, limit=12):
    return execute_spotify_api_call(
        user,
        endpoint=f"search?q={query}&type={types}&limit={limit}",
        other_base_url=BASE_URL
    )


def add_to_queue(user, uri):
    return execute_spotify_api_call(user, f"player/queue?uri={uri}", post_=True)


def get_recommendations(user, track_id, limit=8):
    return execute_spotify_api_call(user, f"recommendations?seed_tracks={track_id}&limit={limit}", other_base_url=BASE_URL)
