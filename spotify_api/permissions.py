from rest_framework.permissions import BasePermission

from .utils import is_spotify_authenticated


class HasSpotifyToken(BasePermission):
    def has_permission(self, request, view):
        return is_spotify_authenticated(request.user)
