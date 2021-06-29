"""MusicRooms URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls.conf import include, re_path
from django.views.generic import TemplateView
from spotify_api.views import SpotifyLogin, GetSpotifyAccessToken, GetSpotifyAuthURL

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # rest-framework and rest-auth
    path('api-auth/', include('rest_framework.urls')),
    path('rest-auth/', include('rest_auth.urls')),
    path('rest-auth/registration/', include('rest_auth.registration.urls')),
    # All-auth routes
    path('accounts/', include('allauth.urls')),

    # Spotify login routes (custom)
    path('api/spotify-url', GetSpotifyAuthURL.as_view()),
    path('api/auth/spotify-token', GetSpotifyAccessToken.as_view()),
    path('api/auth/login', SpotifyLogin.as_view()),

    # Applications
    path('spotify/', include('spotify_api.urls')),
    path('api/', include('api.urls')),
    path('rooms/<str:roomCode>', include('rooms.urls')),

    # frontend
    re_path('.*', TemplateView.as_view(template_name='index.html')),
]
