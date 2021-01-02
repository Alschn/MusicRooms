from spotify.views import AuthURL, CurrentSong, IsAuthenticated, PauseSong, PlaySong, spotify_callback
from django.urls import path


urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('pause', PauseSong.as_view()),
    path('play', PlaySong.as_view()),
]
