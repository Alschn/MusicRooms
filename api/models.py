from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db import models
import random
import string


def generate_unique_code():
    length = 6

    while True:
        code = "".join(random.choices(string.ascii_uppercase, k=length))
        if Room.objects.filter(code=code).count() == 0:
            break
    return code


class User(AbstractUser):
    room = models.ForeignKey('Room', on_delete=models.SET_NULL, related_name='room', null=True, default=None)

    class Meta:
        ordering = ['pk']


class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='host')
    guest_can_pause = models.BooleanField(default=False, null=False)
    votes_to_skip = models.PositiveIntegerField(default=1, null=False, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    current_song = models.CharField(max_length=100, null=True)

    def __str__(self):
        return f"Room ({self.id}) hosted by {self.host}, code {self.code}"

    def get_all_participants(self):
        users = User.objects.filter(room=self)
        return users
