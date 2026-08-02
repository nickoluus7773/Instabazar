from rest_framework import serializers
from .models import UserProfile


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    email = serializers.EmailField(source="user.email", read_only=True)
    joined = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "bio",
            "joined",
        ]

    def get_joined(self, obj):
        return obj.user.date_joined.strftime("%d %b %Y")

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        instance.bio = validated_data.get("bio", instance.bio)

        instance.user.username = user_data.get(
            "username",
            instance.user.username,
        )

        instance.user.save()
        instance.save()

        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
     required=True,
)