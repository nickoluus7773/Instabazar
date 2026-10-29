from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        login_input = str(attrs.get("username", "")).strip()

        # Allow login using either username OR email (case-insensitive)
        user = User.objects.filter(
            Q(username__iexact=login_input) | Q(email__iexact=login_input)
        ).first()

        if user:
            attrs["username"] = user.username

        data = super().validate(attrs)
        data["username"] = self.user.username
        data["is_vendor"] = hasattr(self.user, "vendor_profile")
        if data["is_vendor"]:
            data["store_slug"] = self.user.vendor_profile.store_slug
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
