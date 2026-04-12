from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

from .models import FlamesResult


User = get_user_model()


class FlamesResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlamesResult
        fields = [
            "id",
            "name1",
            "name2",
            "cleaned_name1",
            "cleaned_name2",
            "remaining_count",
            "relationship",
            "created_at",
        ]


class FlamesCalculateRequestSerializer(serializers.Serializer):
    name1 = serializers.CharField(max_length=120, allow_blank=False, trim_whitespace=True)
    name2 = serializers.CharField(max_length=120, allow_blank=False, trim_whitespace=True)


class FlamesHistorySerializer(serializers.ModelSerializer):
    explanation = serializers.SerializerMethodField()

    class Meta:
        model = FlamesResult
        fields = [
            "id",
            "name1",
            "name2",
            "relationship",
            "explanation",
            "created_at",
        ]

    def get_explanation(self, obj):
        from .services.flames_logic import RESULT_EXPLANATIONS

        return RESULT_EXPLANATIONS.get(obj.relationship, "No explanation available.")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid username or password.")

        attrs["user"] = user
        return attrs
