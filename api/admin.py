from api.models import Room, User
from django.contrib import admin


class UserAdmin(admin.ModelAdmin):
    list_display = (
        'username', 'id', 'email', 'is_active', 'is_staff', 'room'
    )


admin.site.register(User, UserAdmin)
admin.site.register(Room)
