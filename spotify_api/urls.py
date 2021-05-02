from spotify_api.views import CurrentSong, CurrentUser, PauseSong, PlaySong, SkipSong, \
    spotify_callback, SetVolume, PerformSearch, QueueHandler, GetRecommendations
from django.urls import path


urlpatterns = [
    path('redirect', spotify_callback),     # not used right now
    path('get-current-user', CurrentUser.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('pause', PauseSong.as_view()),
    path('play', PlaySong.as_view()),
    path('skip', SkipSong.as_view()),
    path('set-volume', SetVolume.as_view()),
    path('search', PerformSearch.as_view()),
    path('queue', QueueHandler.as_view()),
    path('recommendations', GetRecommendations.as_view())
]
