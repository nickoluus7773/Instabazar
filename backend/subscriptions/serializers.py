from rest_framework import serializers

from subscriptions.models import SubscriptionPlan, VendorSubscription


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "code",
            "name",
            "monthly_price",
            "max_products",
            "analytics_level",
            "instagram_redirect",
            "product_badges",
            "ai_tools",
            "bazaar_choice",
        ]


class VendorSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    is_current = serializers.ReadOnlyField()

    class Meta:
        model = VendorSubscription
        fields = [
            "id",
            "plan",
            "status",
            "starts_at",
            "expires_at",
            "payment_reference",
            "is_current",
            "created_at",
        ]