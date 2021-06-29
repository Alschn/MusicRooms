from datetime import timedelta

from allauth.socialaccount.models import SocialToken
from django.utils import timezone
from requests import post, get, put

from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/"
BASE_URL_ME = "https://api.spotify.com/v1/me/"


def get_user_token(user):
    user_tokens = SocialToken.objects.filter(account__user=user)
    if user_tokens.exists():
        return user_tokens.first()
    return None


def update_user_token(user, access_token, expires_in, refresh_token):
    tokens = get_user_token(user)
    if not tokens:
        return
    tokens.token = access_token
    tokens.token_secret = refresh_token
    tokens.expires_at = timezone.now() + timedelta(seconds=expires_in)
    tokens.save(update_fields=['token', 'token_secret', 'expires_at'])


def is_spotify_authenticated(user) -> bool:
    token = get_user_token(user)
    if token:
        expiry = token.expires_at
        if expiry <= timezone.now():
            refresh_spotify_token(user)
        return True
    return False


def refresh_spotify_token(user):
    refresh_token = get_user_token(user).token_secret

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    expires_in = response.get('expires_in')

    update_user_token(user, access_token, expires_in, refresh_token)


def execute_spotify_api_call(user, endpoint, post_=False, put_=False, other_base_url=None):
    spotify_token = get_user_token(user)
    if not spotify_token:
        return
    headers = {'Content-Type': 'application/json', 'Authorization': "Bearer " + spotify_token.token}

    url = BASE_URL_ME if not other_base_url else other_base_url

    if post_:
        response = post(url + endpoint, headers=headers)
    elif put_:
        response = put(url + endpoint, headers=headers)
    else:
        response = get(url + endpoint, {}, headers=headers)

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
    return execute_spotify_api_call(
        user,
        endpoint=f"recommendations?seed_tracks={track_id}&limit={limit}",
        other_base_url=BASE_URL
    )
