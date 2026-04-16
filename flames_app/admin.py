from django.contrib import admin

from .models import FlamesResult


@admin.register(FlamesResult)
class FlamesResultAdmin(admin.ModelAdmin):
	list_display = ("id", "name1", "name2", "relationship", "remaining_count", "user", "created_at")
	search_fields = ("name1", "name2", "relationship")
	list_filter = ("relationship", "created_at")

# Register your models here.
