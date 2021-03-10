from datetime import timedelta
from django.contrib.auth.models import User
from .models import SpotifyToken
from django.utils import timezone
from requests import post, get, put
from allauth.socialaccount.models import SocialToken, SocialAccount

BASE_URL = "https://api.spotify.com/v1/me/"


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


def execute_spotify_api_call(user, endpoint, post_=False, put_=False):
    spotify_token = get_user_tokens(user)
    headers = {'Content-Type': 'application/json', 'Authorization': "Bearer " + spotify_token}

    if post_:
        post(BASE_URL + endpoint, headers=headers)
    elif put_:
        put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)  # else it is get request
    try:
        return response.json()
    except Exception as e:
        return {'Error': f"{e}"}


def play_song(user):
    return execute_spotify_api_call(user, "player/play", put_=True)


def pause_song(user):
    return execute_spotify_api_call(user, "player/pause", put_=True)


def skip_song(user):
    return execute_spotify_api_call(user, "player/next", post_=True)
