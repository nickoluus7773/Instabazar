from rest_framework import serializers
from .models import Vendor, VendorFollow
from products.models import Product
from subscriptions.services import vendor_can_be_followed


class VendorSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()
    follow_eligible = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    profile_image = serializers.ImageField(required=False, allow_null=True, write_only=True)

    def get_product_count(self, obj):
        from subscriptions.services import get_product_limit
        limit = get_product_limit(obj)
        total = obj.products.filter(is_active=True).count()
        if limit is not None:
            return min(total, limit)
        return total

    def get_logo_url(self, obj):
        if obj.profile_image:
            request = self.context.get("request")
            image_url = obj.profile_image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return obj.logo_url

    def get_follow_eligible(self, obj):
        return vendor_can_be_followed(obj)

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or hasattr(request.user, "vendor_profile"):
            return False
        return VendorFollow.objects.filter(customer=request.user, vendor=obj).exists()

    def get_follower_count(self, obj):
        return VendorFollow.objects.filter(vendor=obj, customer__vendor_profile__isnull=True).count()

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
            'profile_image',
            'subscription_plan',
            'product_count',
            'follow_eligible',
            'is_following',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verification_status', 'logo_url', 'subscription_plan']


class VendorProductSerializer(serializers.ModelSerializer):
    productTitle = serializers.CharField()
    productDescription = serializers.CharField()
    productPrice = serializers.DecimalField(max_digits=10, decimal_places=2)
    productImage = serializers.ImageField(required=False, allow_null=True)
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
            'instagram_post_url',
        ]

    def get_is_active(self, obj):
        return obj.is_active

    def get_views_count(self, obj):
        return 0


class VendorDetailSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()
    follow_eligible = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()
    logo_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    def get_product_count(self, obj):
        from subscriptions.services import get_product_limit
        limit = get_product_limit(obj)
        total = obj.products.filter(is_active=True).count()
        if limit is not None:
            return min(total, limit)
        return total

    def get_products(self, obj):
        from subscriptions.services import get_product_limit
        limit = get_product_limit(obj)
        qs = obj.products.filter(is_active=True).order_by("createdAt")
        if limit is not None:
            qs = qs[:limit]
        return VendorProductSerializer(qs, many=True, context=self.context).data

    def to_representation(self, obj):
        data = super().to_representation(obj)
        if obj.profile_image:
            request = self.context.get("request")
            try:
                image_url = obj.profile_image.url
                data["logo_url"] = request.build_absolute_uri(image_url) if request else image_url
            except Exception:
                pass
        return data

    def get_follow_eligible(self, obj):
        return vendor_can_be_followed(obj)

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or hasattr(request.user, "vendor_profile"):
            return False
        return VendorFollow.objects.filter(customer=request.user, vendor=obj).exists()

    def get_follower_count(self, obj):
        return VendorFollow.objects.filter(vendor=obj, customer__vendor_profile__isnull=True).count()

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
            'profile_image',
            'subscription_plan',
            'product_count',
            'products',
            'follow_eligible',
            'is_following',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verification_status', 'store_slug', 'subscription_plan']
