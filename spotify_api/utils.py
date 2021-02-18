from datetime import timedelta
from .models import SpotifyToken
from django.utils import timezone
from requests import post, get, put
from .credentials import CLIENT_ID, CLIENT_SECRET
from allauth.socialaccount.models import SocialToken

BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_tokens(user):
    user_tokens = SocialToken.objects.filter(account=user)
    if user_tokens.exists():
        return user_tokens[0]
    return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    pass
    # tokens = get_user_tokens(session_id)
    # expires = timezone.now() + timedelta(seconds=expires_in)
    #
    # if tokens:
    #     tokens.access_token = access_token
    #     tokens.refresh_token = refresh_token
    #     tokens.expires_in = expires
    #     tokens.token_type = token_type
    #     tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    # else:
    #     tokens = SpotifyToken(
    #         user=session_id,
    #         access_token=access_token,
    #         refresh_token=refresh_token,
    #         token_type=token_type,
    #         expires_in=expires
    #     )
    #     tokens.save()


def is_spotify_authenticated(session_id):
    pass
    # tokens = get_user_tokens(session_id)
    # if tokens:
    #     expire_date = tokens.expires_in
    #     if expire_date <= timezone.now():
    #         refresh_spotify_token(session_id)
    #     return True
    # return False


def refresh_spotify_token(session_id):
    pass
    # refresh_token = get_user_tokens(session_id).refresh_token
    # response = post('https://accounts.spotify.com/api/token', data={
    #     'grant_type': 'refresh_token',
    #     'refresh_token': refresh_token,
    #     'client_id': CLIENT_ID,
    #     'client_secret': CLIENT_SECRET,
    # }).json()
    #
    # access_token = response.get('access_token')
    # token_type = response.get('token_type')
    # expires_in = response.get('expires_in')
    #
    # update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_call(user, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(user)
    headers = {'Content-Type': 'application/json', 'Authorization': "Bearer " + tokens.access_token}

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
