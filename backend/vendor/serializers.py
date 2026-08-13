from rest_framework import serializers
from .models import Vendor
from products.models import Product


class VendorSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Vendor
        fields = [
            'id',
            'business_name',
            'store_slug',
            'instagram_handle',
            'location',
            'follower_count',
            'verification_status',
            'logo_url',
            'subscription_plan',
            'product_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verification_status']


class VendorProductSerializer(serializers.ModelSerializer):
    productTitle = serializers.CharField()
    productDescription = serializers.CharField()
    productPrice = serializers.DecimalField(max_digits=10, decimal_places=2)
    productImage = serializers.CharField(allow_blank=True)
    category = serializers.StringRelatedField()
    productStock = serializers.IntegerField()
    productCondition = serializers.CharField(allow_blank=True)
    is_active = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'productTitle',
            'productDescription',
            'productPrice',
            'productImage',
            'productCondition',
            'is_active',
            'views_count',
            'category',
            'productStock',
        ]

    def get_is_active(self, obj):
        return True

    def get_views_count(self, obj):
        return 0


class VendorDetailSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)
    products = VendorProductSerializer(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = [
            'id',
            'business_name',
            'store_slug',
            'instagram_handle',
            'location',
            'bio',
            'follower_count',
            'verification_status',
            'logo_url',
            'subscription_plan',
            'product_count',
            'products',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verification_status', 'store_slug']
