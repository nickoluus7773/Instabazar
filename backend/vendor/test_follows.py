from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from products.models import Category, Product
from subscriptions.models import SubscriptionPlan, VendorSubscription
from vendor.models import Vendor, VendorFollow

User = get_user_model()


class VendorFollowFeatureTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.standard = SubscriptionPlan.objects.create(
            code="standard", name="Standard", monthly_price=Decimal("10"),
            max_products=50, analytics_level="standard",
        )
        cls.advanced = SubscriptionPlan.objects.create(
            code="advanced", name="Advanced", monthly_price=Decimal("20"),
            max_products=None, analytics_level="advanced",
        )
        cls.free = SubscriptionPlan.objects.create(
            code="free", name="Free", monthly_price=Decimal("0"),
            max_products=10, analytics_level="basic",
        )
        cls.customer = User.objects.create_user(username="customer", password="pass")
        cls.other_customer = User.objects.create_user(username="other", password="pass")
        cls.vendor_user = User.objects.create_user(username="seller", password="pass")
        cls.free_user = User.objects.create_user(username="free_seller", password="pass")
        cls.vendor = Vendor.objects.create(
            user=cls.vendor_user, business_name="Standard Store", store_slug="standard-store",
            verification_status="verified",
        )
        cls.free_vendor = Vendor.objects.create(
            user=cls.free_user, business_name="Free Store", store_slug="free-store",
            verification_status="verified",
        )
        now = timezone.now()
        VendorSubscription.objects.create(
            vendor=cls.vendor, plan=cls.standard, status="active",
            starts_at=now - timedelta(days=1), expires_at=now + timedelta(days=5),
        )
        category = Category.objects.create(categoryName="Clothing")
        cls.product = Product.objects.create(
            vendor=cls.vendor, productTitle="Visible", productDescription="",
            productPrice=Decimal("10"), productStock=1, productCondition="New",
            category=category, is_active=True,
        )
        cls.inactive_product = Product.objects.create(
            vendor=cls.vendor, productTitle="Hidden", productDescription="",
            productPrice=Decimal("10"), productStock=1, productCondition="New",
            category=category, is_active=False,
        )

    def setUp(self):
        self.client = APIClient()

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_customer_can_follow_eligible_vendor_and_duplicate_is_unique(self):
        self.authenticate(self.customer)
        first = self.client.post("/api/vendor/follows/", {"vendor_id": self.vendor.pk}, format="json")
        second = self.client.post("/api/vendor/follows/", {"vendor_id": self.vendor.pk}, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(VendorFollow.objects.filter(customer=self.customer, vendor=self.vendor).count(), 1)

    def test_free_vendor_is_rejected_and_not_eligible_in_public_api(self):
        self.authenticate(self.customer)
        response = self.client.post("/api/vendor/follows/", {"vendor_id": self.free_vendor.pk}, format="json")
        self.assertEqual(response.status_code, 403)
        public = self.client.get("/api/vendor/public/")
        free = next(item for item in public.data if item["id"] == self.free_vendor.pk)
        self.assertFalse(free["follow_eligible"])

    def test_vendor_cannot_follow_or_read_customer_feed(self):
        self.authenticate(self.vendor_user)
        self.assertEqual(self.client.post("/api/vendor/follows/", {"vendor_id": self.vendor.pk}, format="json").status_code, 403)
        self.assertEqual(self.client.get("/api/vendor/feed/").status_code, 403)

    def test_unfollow_and_customer_follow_status(self):
        VendorFollow.objects.create(customer=self.customer, vendor=self.vendor)
        self.authenticate(self.customer)
        followed = self.client.get("/api/vendor/follows/")
        self.assertTrue(followed.data[0]["is_following"])
        response = self.client.delete(f"/api/vendor/follows/{self.vendor.pk}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(VendorFollow.objects.filter(customer=self.customer, vendor=self.vendor).exists())

    def test_public_vendor_data_includes_authenticated_customer_follow_status(self):
        VendorFollow.objects.create(customer=self.customer, vendor=self.vendor)
        self.authenticate(self.customer)
        response = self.client.get("/api/vendor/public/standard-store/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.vendor.pk)
        self.assertTrue(response.data["follow_eligible"])
        self.assertTrue(response.data["is_following"])

    def test_personal_feed_has_only_active_products_from_followed_vendor(self):
        VendorFollow.objects.create(customer=self.customer, vendor=self.vendor)
        self.authenticate(self.customer)
        response = self.client.get("/api/vendor/feed/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data["results"]], [self.product.pk])

    def test_vendor_follower_list_is_scoped_to_own_vendor(self):
        VendorFollow.objects.create(customer=self.customer, vendor=self.vendor)
        self.authenticate(self.vendor_user)
        response = self.client.get("/api/vendor/followers/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["username"], self.customer.username)

    def test_logged_out_user_cannot_follow_or_read_feed(self):
        self.assertEqual(self.client.post("/api/vendor/follows/", {"vendor_id": self.vendor.pk}, format="json").status_code, 401)
        self.assertEqual(self.client.get("/api/vendor/feed/").status_code, 401)
