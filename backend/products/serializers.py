
from rest_framework import serializers

from .models import Product, Category


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field="categoryName",
        queryset=Category.objects.all(),
    )

    vendor = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"
