
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from rest_framework.test import APIClient

from subscriptions.models import SubscriptionPlan, VendorSubscription
from vendor.models import Vendor


User = get_user_model()


class InstagramSubscriptionRedirectTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.free_plan = SubscriptionPlan.objects.create(
            code="free",
            name="Free",
            monthly_price=Decimal("0.00"),
            max_products=10,
            analytics_level="basic",
        )

        cls.standard_plan = SubscriptionPlan.objects.create(
            code="standard",
            name="Standard",
            monthly_price=Decimal("149.00"),
            max_products=50,
            analytics_level="standard",
            instagram_redirect=True,
            product_badges=True,
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="redirect_test_user",
            password="test-password-123",
        )

        self.vendor = Vendor.objects.create(
            user=self.user,
            business_name="Redirect Test Store",
            store_slug="redirect-test-store",
            instagram_handle="test.store",
            verification_status="verified",
        )

        self.client = APIClient()
        self.url = reverse(
            "public-vendor-instagram-redirect",
            kwargs={"store_slug": self.vendor.store_slug},
        )

    def activate_standard_plan(self, expires_at=None):
        now = timezone.now()

        return VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=self.standard_plan,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(minutes=1),
            expires_at=expires_at or now + timedelta(days=30),
        )

    def test_free_vendor_cannot_redirect(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data["code"],
            "INSTAGRAM_REDIRECT_UPGRADE_REQUIRED",
        )

    def test_active_standard_vendor_can_redirect(self):
        self.activate_standard_plan()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response["Location"],
            "https://www.instagram.com/test.store/",
        )

    def test_expired_standard_subscription_cannot_redirect(self):
        self.activate_standard_plan(
            expires_at=timezone.now() - timedelta(minutes=1)
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 403)

    def test_unverified_vendor_cannot_redirect(self):
        self.vendor.verification_status = "pending"
        self.vendor.save(update_fields=["verification_status"])

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 404)

    def test_missing_instagram_handle_cannot_redirect(self):
        self.vendor.instagram_handle = ""
        self.vendor.save(update_fields=["instagram_handle"])

        self.activate_standard_plan()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 404)
