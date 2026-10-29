from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone


from rest_framework.test import APITestCase
from rest_framework import status


from vendor.models import Vendor
from subscriptions.models import SubscriptionPlan, VendorSubscription
from subscriptions.services import (
    get_effective_plan,
    get_current_subscription,
    can_add_product,
    vendor_has_feature,
    change_subscription_plan,
    activate_paid_subscription,
    expire_old_subscriptions,
    get_subscription_access_cutoff,
)


User = get_user_model()


class SubscriptionServiceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.free = SubscriptionPlan.objects.create(
            code="free",
            name="Free",
            monthly_price=Decimal("0.00"),
            max_products=10,
            analytics_level="basic",
        )
        cls.standard = SubscriptionPlan.objects.create(
            code="standard",
            name="Standard",
            monthly_price=Decimal("149.00"),
            max_products=50,
            analytics_level="standard",
            instagram_redirect=True,
            product_badges=True,
        )
        cls.advanced = SubscriptionPlan.objects.create(
            code="advanced",
            name="Advanced",
            monthly_price=Decimal("249.00"),
            max_products=None,
            analytics_level="advanced",
            instagram_redirect=True,
            product_badges=True,
            ai_tools=True,
            bazaar_choice=True,
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="subscription_test_user",
            password="test-password-123",
        )
        self.vendor = Vendor.objects.create(
            user=self.user,
            business_name="Test Store",
        )

    def create_subscription(
        self,
        plan,
        status=VendorSubscription.Status.ACTIVE,
        starts_at=None,
        expires_at=None,
    ):
        return VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=plan,
            status=status,
            starts_at=starts_at or timezone.now() - timedelta(minutes=1),
            expires_at=expires_at,
        )

    def test_new_vendor_gets_free_plan(self):
        self.assertEqual(get_effective_plan(self.vendor), self.free)

    def test_pending_paid_plan_does_not_grant_benefits(self):
        self.create_subscription(
            self.standard,
            status=VendorSubscription.Status.PENDING,
            starts_at=None,
        )

        self.assertEqual(get_effective_plan(self.vendor), self.free)
        self.assertFalse(
            vendor_has_feature(self.vendor, "instagram_redirect")
        )

    def test_active_standard_plan_grants_standard_features(self):
        self.create_subscription(self.standard)

        self.assertEqual(get_effective_plan(self.vendor), self.standard)
        self.assertTrue(
            vendor_has_feature(self.vendor, "instagram_redirect")
        )
        self.assertFalse(
            vendor_has_feature(self.vendor, "ai_tools")
        )

    def test_expired_subscription_falls_back_to_free(self):
        subscription = self.create_subscription(
            self.standard,
            expires_at=timezone.now() - timedelta(days=2),
        )

        self.assertEqual(
            get_effective_plan(self.vendor),
            self.free,
        )


    def test_expiry_job_marks_expired_subscriptions(self):
        subscription = self.create_subscription(
            self.standard,
            expires_at=timezone.now() - timedelta(days=2),
        )

        expire_old_subscriptions()

        subscription.refresh_from_db()

        self.assertEqual(
            subscription.status,
            VendorSubscription.Status.EXPIRED,
        )
    

    def test_advanced_plan_has_unlimited_product_limit(self):
        self.create_subscription(self.advanced)

        self.assertIsNone(get_effective_plan(self.vendor).max_products)
        self.assertTrue(vendor_has_feature(self.vendor, "ai_tools"))
        self.assertTrue(vendor_has_feature(self.vendor, "bazaar_choice"))

    
    def test_selecting_paid_plan_creates_pending_request(self):
        subscription = change_subscription_plan(
            self.vendor,
            "standard",
        )

        self.assertEqual(
            subscription.status,
            VendorSubscription.Status.PENDING,
        )
        self.assertEqual(get_effective_plan(self.vendor), self.free)

    def test_selecting_another_paid_plan_cancels_old_pending_request(self):
        old_pending = change_subscription_plan(self.vendor, "standard")
        new_pending = change_subscription_plan(self.vendor, "advanced")

        old_pending.refresh_from_db()
        self.assertEqual(old_pending.status, VendorSubscription.Status.CANCELLED)
        self.assertEqual(new_pending.status, VendorSubscription.Status.PENDING)

        with self.assertRaisesMessage(ValueError, "Only pending subscriptions"):
            activate_paid_subscription(old_pending, "old-payment-reference")

    def test_selecting_free_cancels_pending_paid_request(self):
        pending = change_subscription_plan(self.vendor, "standard")

        result = change_subscription_plan(self.vendor, "free")

        pending.refresh_from_db()
        self.assertIsNone(result)
        self.assertEqual(pending.status, VendorSubscription.Status.CANCELLED)

    
    def test_selecting_free_is_idempotent_when_free_subscription_is_current(self):
        current_free = self.create_subscription(self.free)
        pending = change_subscription_plan(self.vendor, "standard")

        result = change_subscription_plan(self.vendor, "free")

        current_free.refresh_from_db()
        pending.refresh_from_db()

        self.assertIsNone(result)
        self.assertEqual(
            current_free.status,
            VendorSubscription.Status.ACTIVE,
        )
        self.assertEqual(
            pending.status,
            VendorSubscription.Status.CANCELLED,
        )

    def test_inactive_plan_is_not_effective_or_current(self):
        subscription = self.create_subscription(self.standard)
        self.standard.is_active = False
        self.standard.save(update_fields=["is_active"])

        self.assertEqual(get_effective_plan(self.vendor), self.free)
        self.assertIsNone(get_current_subscription(self.vendor))
        subscription.refresh_from_db()
        self.assertFalse(subscription.is_current)

    def test_inactive_plan_cannot_be_activated(self):
        pending = change_subscription_plan(self.vendor, "standard")
        self.standard.is_active = False
        self.standard.save(update_fields=["is_active"])

        with self.assertRaisesMessage(ValueError, "plan is no longer available"):
            activate_paid_subscription(pending, "verified-reference")

        pending.refresh_from_db()
        self.assertEqual(pending.status, VendorSubscription.Status.PENDING)

    def test_paid_subscription_activates_after_verification(self):
        pending = change_subscription_plan(self.vendor, "standard")

        activated = activate_paid_subscription(
            pending,
            "verified-payment-reference",
        )

        self.assertEqual(activated.status, VendorSubscription.Status.ACTIVE)
        self.assertEqual(
            activated.payment_reference,
            "verified-payment-reference",
        )
        self.assertIsNotNone(activated.starts_at)
        self.assertGreater(activated.expires_at, activated.starts_at)
        self.assertEqual(get_effective_plan(self.vendor), self.standard)

    def test_unknown_feature_is_rejected(self):
        with self.assertRaises(ValueError):
            vendor_has_feature(self.vendor, "made_up_feature")
    

    def test_subscription_access_is_valid_one_second_before_noon(self):
        from datetime import timedelta
        from subscriptions.services import is_subscription_access_valid

        expires_at = timezone.now() - timedelta(days=1)
        subscription = self.create_subscription(
            self.standard,
            expires_at=expires_at,
        )

        # Ensure the subscription had already started at the simulated time.
        subscription.starts_at = expires_at - timedelta(days=30)
        subscription.save(update_fields=["starts_at"])

        cutoff = get_subscription_access_cutoff(expires_at)
        before_cutoff = cutoff - timedelta(seconds=1)

        self.assertTrue(
            is_subscription_access_valid(subscription, before_cutoff)
        )

    def test_subscription_access_expires_exactly_at_noon(self):
        from datetime import timedelta
        from subscriptions.services import is_subscription_access_valid

        expires_at = timezone.now() - timedelta(days=1)
        subscription = self.create_subscription(
            self.standard,
            expires_at=expires_at,
        )

        cutoff = get_subscription_access_cutoff(expires_at)

        self.assertFalse(
            is_subscription_access_valid(subscription, cutoff)
        )


    def test_expiry_job_does_not_expire_subscription_before_noon(self):
        from unittest.mock import patch
        from subscriptions.services import get_subscription_access_cutoff

        expires_at = timezone.now() - timedelta(days=1)
        subscription = self.create_subscription(
            self.standard,
            expires_at=expires_at,
        )

        cutoff = get_subscription_access_cutoff(expires_at)

        with patch("subscriptions.services.timezone.now", return_value=cutoff - timedelta(seconds=1)):
            expire_old_subscriptions()

        subscription.refresh_from_db()
        self.assertEqual(subscription.status, VendorSubscription.Status.ACTIVE)

        with patch("subscriptions.services.timezone.now", return_value=cutoff):
            expire_old_subscriptions()

        subscription.refresh_from_db()
        self.assertEqual(subscription.status, VendorSubscription.Status.EXPIRED)


class SubscriptionAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.free = SubscriptionPlan.objects.create(
            code="free",
            name="Free",
            monthly_price=Decimal("0.00"),
            max_products=10,
            analytics_level="basic",
        )
        cls.standard = SubscriptionPlan.objects.create(
            code="standard",
            name="Standard",
            monthly_price=Decimal("149.00"),
            max_products=50,
            analytics_level="standard",
            instagram_redirect=True,
            product_badges=True,
        )
        cls.advanced = SubscriptionPlan.objects.create(
            code="advanced",
            name="Advanced",
            monthly_price=Decimal("249.00"),
            max_products=None,
            analytics_level="advanced",
            instagram_redirect=True,
            product_badges=True,
            ai_tools=True,
            bazaar_choice=True,
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="api_subscription_user",
            password="test-password-123",
        )
        self.vendor = Vendor.objects.create(
            user=self.user,
            business_name="API Test Store",
        )
        self.client.force_authenticate(user=self.user)

    def test_public_plans_endpoint(self):
        response = self.client.get("/subscriptions/plans/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_current_subscription_defaults_to_free(self):
        response = self.client.get("/subscriptions/current/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["plan"]["code"], "free")
        self.assertIsNone(response.data["subscription"])

    def test_subscribe_creates_pending_request(self):
        response = self.client.post(
            "/subscriptions/subscribe/",
            {"plan_code": "standard"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_202_ACCEPTED,
        )
        self.assertEqual(
            VendorSubscription.objects.get(
                vendor=self.vendor
            ).status,
            VendorSubscription.Status.PENDING,
        )
        
    def test_selecting_free_when_already_on_free_returns_ok(self):
        now = timezone.now()

        VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=self.free,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(minutes=1),
            expires_at=None,
        )

        response = self.client.post(
            "/subscriptions/subscribe/",
            {"plan_code": "free"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(response.data["plan_code"], "free")


    def test_invalid_plan_is_rejected(self):
        response = self.client.post(
            "/subscriptions/subscribe/",
            {"plan_code": "gold"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_subscription_history_endpoint(self):
        response = self.client.get("/subscriptions/history/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_subscription_endpoints_require_authentication(self):
        self.client.force_authenticate(user=None)

        for url in (
            "/subscriptions/current/",
            "/subscriptions/history/",
            "/subscriptions/subscribe/",
            "/subscriptions/cancel/",
        ):
            response = self.client.get(url)
            self.assertIn(response.status_code, (401, 403, 405))

    def test_cancel_paid_subscription_keeps_access_and_sets_remaining_days(self):
        now = timezone.now()
        sub = VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=self.standard,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(days=5),
            expires_at=now + timedelta(days=25),
        )

        response = self.client.post("/subscriptions/cancel/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        sub.refresh_from_db()
        self.assertTrue(sub.is_cancelled)
        self.assertIsNotNone(sub.cancelled_at)
        self.assertTrue(sub.is_current)
        self.assertEqual(response.data["days_remaining"], 25)

    def test_cancel_free_subscription_fails(self):
        response = self.client.post("/subscriptions/cancel/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)