from spotify.views import AuthURL, CurrentSong, IsAuthenticated, spotify_callback
from django.urls import path


urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
]
