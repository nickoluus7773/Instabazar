from django.contrib import admin
from .models import Vendor
from subscriptions.models import VendorSubscription
from subscriptions.services import get_effective_plan


class VendorSubscriptionInline(admin.TabularInline):
    model = VendorSubscription
    extra = 0
    can_delete = False
    fields = ("plan", "status", "starts_at", "expires_at", "created_at")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'verification_status', 'current_subscription_plan', 'follower_count', 'created_at']
    list_filter = ['verification_status', 'created_at']
    search_fields = ['business_name', 'user__username', 'store_slug']
    readonly_fields = ['created_at', 'updated_at', 'current_subscription_plan']
    inlines = [VendorSubscriptionInline]

    @admin.display(description="Current subscription plan")
    def current_subscription_plan(self, obj):
        try:
            return get_effective_plan(obj).name
        except ValueError:
            return "Free plan not configured"
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Business Information', {
            'fields': ('business_name', 'store_slug', 'bio', 'location', 'instagram_handle')
        }),
        ('Store', {
            'fields': ('logo_url',)
        }),
        ('Metrics', {
            'fields': ('follower_count',)
        }),
        ('Verification & Plan', {
            'fields': ('verification_status', 'current_subscription_plan')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
