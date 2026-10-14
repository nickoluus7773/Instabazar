
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from subscriptions.models import SubscriptionPlan, VendorSubscription
from vendor.models import Vendor


User = get_user_model()


class SubscriptionCurrentStateTests(TestCase):
    def test_inactive_plan_is_not_current(self):
        user = User.objects.create_user(
            username="inactive_plan_test",
            password="test-password-123",
        )

        vendor = Vendor.objects.create(
            user=user,
            business_name="Inactive Plan Store",
            store_slug="inactive-plan-store",
        )

        plan = SubscriptionPlan.objects.create(
            code="standard",
            name="Standard",
            monthly_price=Decimal("149.00"),
            max_products=50,
            analytics_level="standard",
            instagram_redirect=True,
            is_active=False,
        )

        now = timezone.now()

        subscription = VendorSubscription.objects.create(
            vendor=vendor,
            plan=plan,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(minutes=1),
            expires_at=now + timedelta(days=30),
        )

        self.assertFalse(subscription.is_current)
