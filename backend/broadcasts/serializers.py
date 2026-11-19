from rest_framework import serializers
from .models import Broadcast, BroadcastClick


class BroadcastSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.business_name", read_only=True)
    vendor_slug = serializers.CharField(source="vendor.store_slug", read_only=True)
    vendor_logo = serializers.SerializerMethodField()
    product_details = serializers.SerializerMethodField()
    recipient_count = serializers.IntegerField(read_only=True)
    read_count = serializers.IntegerField(read_only=True)
    product_click_count = serializers.IntegerField(read_only=True)
    storefront_click_count = serializers.IntegerField(read_only=True)
    is_read = serializers.BooleanField(read_only=True)

    class Meta:
        model = Broadcast
        fields = ["id", "vendor", "vendor_name", "vendor_slug", "vendor_logo", "title", "message", "image",
                  "product", "product_details", "status", "created_at", "published_at", "updated_at",
                  "recipient_count", "read_count", "product_click_count", "storefront_click_count", "is_read"]
        read_only_fields = ["vendor", "status", "created_at", "published_at", "updated_at"]

    def get_vendor_logo(self, obj):
        if obj.vendor.profile_image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.vendor.profile_image.url) if request else obj.vendor.profile_image.url
        return obj.vendor.logo_url

    def get_product_details(self, obj):
        product = obj.product
        if not product:
            return None
        request = self.context.get("request")
        image = request.build_absolute_uri(product.productImage.url) if request and product.productImage else (product.productImage.url if product.productImage else None)
        return {"id": product.pk, "title": product.productTitle, "price": str(product.productPrice), "image": image}

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Message is required.")
        return value

    def validate_product(self, product):
        request = self.context.get("request")
        if product and (not product.is_active or product.vendor.user_id != request.user.id):
            raise serializers.ValidationError("Choose an active product from your own catalog.")
        return product

    def validate(self, attrs):
        if self.instance and self.instance.status != Broadcast.Status.DRAFT:
            raise serializers.ValidationError("Published broadcasts cannot be edited.")
        return attrs


class ClickSerializer(serializers.Serializer):
    click_type = serializers.ChoiceField(choices=BroadcastClick.ClickType.choices)
