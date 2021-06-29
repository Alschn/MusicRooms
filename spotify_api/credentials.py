import os
from django.conf import settings

CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
PROD_URL = ''
API_URL = 'http://127.0.0.1:8000'
REDIRECT_URI_PROD = "http://127.0.0.1:8000/callback"
REDIRECT_URI_DEV = 'http://127.0.0.1:3000/callback'

REDIRECT_URI = REDIRECT_URI_DEV if bool(settings.DEBUG) else REDIRECT_URI_PROD
