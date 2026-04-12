from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()


class FlamesResult(models.Model):
	RELATIONSHIP_CHOICES = [
		("Friends", "Friends"),
		("Love", "Love"),
		("Affection", "Affection"),
		("Marriage", "Marriage"),
		("Enemies", "Enemies"),
		("Siblings", "Siblings"),
	]

	name1 = models.CharField(max_length=120)
	name2 = models.CharField(max_length=120)
	cleaned_name1 = models.CharField(max_length=120)
	cleaned_name2 = models.CharField(max_length=120)
	remaining_count = models.PositiveIntegerField()
	relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
	user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="flames_results")
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"{self.name1} + {self.name2} => {self.relationship}"
