from django.contrib import admin

# Register your models here.
from django.contrib import admin

from subscriptions.models import SubscriptionPlan, VendorSubscription


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "monthly_price",
        "max_products",
        "analytics_level",
        "is_active",
    )
    list_filter = ("is_active", "analytics_level")
    search_fields = ("name", "code")
    ordering = ("monthly_price",)


@admin.register(VendorSubscription)
class VendorSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "vendor",
        "plan",
        "status",
        "starts_at",
        "expires_at",
        "created_at",
    )
    list_filter = ("status", "plan")
    search_fields = (
        "vendor__business_name",
        "payment_reference",
    )
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)