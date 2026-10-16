
from rest_framework import serializers
from urllib.parse import urlparse

from .models import Product, Category


class ProductSerializer(serializers.ModelSerializer):
    instagram_post_url = serializers.URLField(required=False, allow_blank=True, allow_null=True, max_length=500)
    category = serializers.SlugRelatedField(
        slug_field="categoryName",
        queryset=Category.objects.all(),
    )

    vendor = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"

    def validate_instagram_post_url(self, value):
        if not value:
            return value

        parsed = urlparse(value)
        host = (parsed.hostname or "").lower()
        path_parts = parsed.path.strip("/").split("/")
        if (
            parsed.scheme != "https"
            or host not in {"instagram.com", "www.instagram.com"}
            or len(path_parts) < 2
            or path_parts[0] not in {"p", "reel", "tv"}
            or not path_parts[1]
        ):
            raise serializers.ValidationError("Enter a direct Instagram post, reel, or video URL.")
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get("instagram_post_url"):
            raise serializers.ValidationError({"instagram_post_url": "A product-specific Instagram post URL is required."})
        return attrs
