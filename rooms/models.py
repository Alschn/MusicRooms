from django.db import models

from api.models import User, Room


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="messages")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="messages")
    timestamp = models.DateTimeField(auto_now_add=True)
    content = models.TextField()

    class Meta:
        ordering = ('-timestamp', )

    def __str__(self):
        return f"{self.content} by {self.sender}"

