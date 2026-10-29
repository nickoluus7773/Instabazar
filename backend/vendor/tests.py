
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from products.models import Category, Product, WishlistItem
from subscriptions.models import SubscriptionPlan, VendorSubscription
from vendor.models import Vendor


User = get_user_model()


class VendorAnalyticsSubscriptionTests(TestCase):

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

        cls.advanced_plan = SubscriptionPlan.objects.create(
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

        cls.category = Category.objects.create(
            categoryName="Test Category"
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="analytics_vendor",
            password="test-password-123",
        )

        self.vendor = Vendor.objects.create(
            user=self.user,
            business_name="Analytics Store",
            store_slug="analytics-store",
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            vendor=self.vendor,
            productTitle="Test Product",
            productDescription="A product for analytics tests",
            productPrice=Decimal("100.00"),
            productStock=5,
            productCondition="new",
            category=self.category,
        )

    def activate_plan(self, plan):
        now = timezone.now()

        return VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=plan,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(minutes=1),
            expires_at=now + timedelta(days=30),
        )

    def add_wishlist_save(self, username):
        user = User.objects.create_user(
            username=username,
            password="test-password-123",
        )

        WishlistItem.objects.create(
            user=user,
            product=self.product,
        )

        return user


    def test_free_plan_can_access_basic_stats(self):
        response = self.client.get("/api/vendor/stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["analytics_level"], "basic")
        self.assertEqual(response.data["total_products"], 1)

        # These metrics are not backed by real tracking models yet.
        self.assertIsNone(response.data["total_views"])
        self.assertIsNone(response.data["total_orders"])
        self.assertIsNone(response.data["total_revenue"])
        self.assertIsNone(response.data["average_rating"])

    def test_free_plan_cannot_access_product_level_analytics(self):
        response = self.client.get(
            "/api/vendor/wishlist-analysis/"
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data["code"],
            "ANALYTICS_UPGRADE_REQUIRED",
        )

    def test_standard_plan_receives_product_wishlist_counts(self):
        self.activate_plan(self.standard_plan)
        self.add_wishlist_save("standard_customer")

        response = self.client.get(
            "/api/vendor/wishlist-analysis/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["analytics_level"], "standard")
        self.assertEqual(response.data["total_wishlist_saves"], 1)
        self.assertEqual(response.data["products"][0]["wishlist_count"], 1)

        # Advanced-only details aren't exposed to Standard vendors.
        self.assertIsNone(
            response.data["products"][0]["customer_count"]
        )
        self.assertIsNone(response.data["total_customers"])
        self.assertIsNone(
            response.data["most_wishlisted_product"]
        )

    def test_advanced_plan_receives_unique_customer_analytics(self):
        self.activate_plan(self.advanced_plan)

        self.add_wishlist_save("advanced_customer_one")
        self.add_wishlist_save("advanced_customer_two")

        response = self.client.get(
            "/api/vendor/wishlist-analysis/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["analytics_level"], "advanced")
        self.assertEqual(response.data["total_wishlist_saves"], 2)
        self.assertEqual(response.data["total_customers"], 2)

        self.assertEqual(
            response.data["most_wishlisted_product"]["id"],
            self.product.id,
        )

        self.assertEqual(
            response.data["products"][0]["customer_count"],
            2,
        )

    def test_expired_subscription_does_not_grant_analytics(self):
        now = timezone.now()

        VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=self.standard_plan,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(days=31),
            expires_at=now - timedelta(days=2),
        )

        response = self.client.get(
            "/api/vendor/wishlist-analysis/"
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.data["current_analytics_level"],
            "basic",
        )


class InstagramProductPostUrlTests(TestCase):
    def setUp(self):
        SubscriptionPlan.objects.create(
            code="free",
            name="Free",
            monthly_price=Decimal("0.00"),
            max_products=10,
            analytics_level="basic",
        )
        self.user = User.objects.create_user(
            username="instagram_post_vendor",
            password="test-password-123",
        )
        self.vendor = Vendor.objects.create(
            user=self.user,
            business_name="Instagram Post Store",
            store_slug="instagram-post-store",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.payload = {
            "title": "Product with post",
            "description": "A test product",
            "price": "99.00",
            "category": "Clothing",
        }

    def test_create_allows_optional_instagram_post_url_but_validates_format(self):
        # Missing or empty instagram_post_url is now optional (succeeds)
        missing = self.client.post("/api/vendor/products/", self.payload)
        self.assertEqual(missing.status_code, 201)

        invalid = self.client.post(
            "/api/vendor/products/",
            {**self.payload, "instagram_post_url": "https://www.instagram.com/store/"},
        )
        self.assertEqual(invalid.status_code, 400)
        self.assertIn("instagram_post_url", invalid.data)

    def test_create_saves_and_returns_product_post_url(self):
        post_url = "https://www.instagram.com/p/product_post_123/"
        created = self.client.post(
            "/api/vendor/products/",
            {**self.payload, "instagram_post_url": post_url},
        )

        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["instagram_post_url"], post_url)
        product = Product.objects.get(pk=created.data["id"])
        self.assertEqual(product.instagram_post_url, post_url)

        public = self.client.get(f"/api/products/{product.pk}/")
        self.assertEqual(public.status_code, 200)
        self.assertEqual(public.data["instagram_post_url"], post_url)

    def test_legacy_product_can_be_updated_with_a_post_url(self):
        category = Category.objects.create(categoryName="Clothing")
        product = Product.objects.create(
            vendor=self.vendor,
            productTitle="Legacy product",
            productDescription="",
            productPrice=Decimal("99.00"),
            productStock=1,
            productCondition="New",
            category=category,
        )
        post_url = "https://instagram.com/reel/product_reel_456/"

        response = self.client.patch(
            f"/api/vendor/products/{product.pk}/",
            {"instagram_post_url": post_url},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["instagram_post_url"], post_url)

    def test_vendor_analysis_endpoint_free_plan(self):
        category = Category.objects.create(categoryName="Clothing")
        Product.objects.create(
            vendor=self.vendor,
            productTitle="Test Analysis Product",
            productPrice=Decimal("50.00"),
            productStock=2,
            category=category,
            instagram_post_url="https://www.instagram.com/p/test_analysis/",
        )
        response = self.client.get("/api/vendor/analysis/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["plan_code"], "free")
        self.assertIsNotNone(response.data["latest_product"])
        self.assertIsNone(response.data["instagram_dm_clicks"])
        self.assertIsNone(response.data["trend_charts"])
        self.assertIsNone(response.data["category_performance"])
        self.assertFalse(response.data["can_export_csv"])
        self.assertEqual(response.data["top_products_limit"], 3)

    def test_vendor_analysis_endpoint_standard_plan(self):
        standard, _ = SubscriptionPlan.objects.get_or_create(
            code="standard",
            defaults={
                "name": "Standard",
                "monthly_price": Decimal("149.00"),
                "max_products": 50,
                "analytics_level": "standard",
            },
        )
        now = timezone.now()
        VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=standard,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(days=1),
            expires_at=now + timedelta(days=29),
        )

        response = self.client.get("/api/vendor/analysis/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["plan_code"], "standard")
        self.assertIsNotNone(response.data["instagram_dm_clicks"])
        self.assertIsNotNone(response.data["trend_charts"])
        self.assertEqual(len(response.data["trend_charts"]), 7)
        self.assertIsNotNone(response.data["category_performance"])
        self.assertFalse(response.data["can_export_csv"])
        self.assertEqual(response.data["top_products_limit"], 5)
