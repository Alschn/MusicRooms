from django.urls import path
from frontend.views import index

app_name = 'frontend'   # so that we could redirect to this app

urlpatterns = [
    path('', index, name=''),
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>', index),
]
