
from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Product, Category
from vendor.models import Vendor
from subscriptions.models import SubscriptionPlan, VendorSubscription


User = get_user_model()


class ProductSubscriptionLimitTests(APITestCase):
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
        )
        cls.advanced = SubscriptionPlan.objects.create(
            code="advanced",
            name="Advanced",
            monthly_price=Decimal("249.00"),
            max_products=None,
            analytics_level="advanced",
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="product_limit_user",
            password="test-password-123",
        )
        self.vendor = Vendor.objects.create(
            user=self.user,
            business_name="Product Limit Store",
        )
        self.category = Category.objects.create(
            categoryName="Clothing",
        )
        self.client.force_authenticate(user=self.user)

    def create_products(self, count):
        for index in range(count):
            Product.objects.create(
                vendor=self.vendor,
                productTitle=f"Existing Product {index}",
                productDescription="Test product",
                productPrice=Decimal("100.00"),
                productStock=5,
                productCondition="New",
                category=self.category,
            )

    def activate_plan(self, plan):
        now = timezone.now()
        return VendorSubscription.objects.create(
            vendor=self.vendor,
            plan=plan,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=now - timedelta(minutes=1),
            expires_at=(
                None
                if plan.code == "free"
                else now + timedelta(days=30)
            ),
        )

    def standard_product_payload(self):
        return {
            "productTitle": "New Test Product",
            "productDescription": "A test product",
            "productPrice": "199.00",
            "productStock": 5,
            "productCondition": "New",
            "category": "Clothing",
            "instagram_post_url": "https://www.instagram.com/p/test_product_post/",
        }

    def vendor_product_payload(self):
        return {
            "title": "New Test Product",
            "description": "A test product",
            "price": "199.00",
            "stock": 5,
            "condition": "New",
            "category": "Clothing",
            "instagram_post_url": "https://www.instagram.com/p/test_product_post/",
        }

    def assert_limit_error(self, response, expected_limit):
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            response.data["code"],
            "PRODUCT_LIMIT_REACHED",
        )
        self.assertEqual(
            response.data["product_limit"],
            expected_limit,
        )
        self.assertTrue(response.data["upgrade_required"])

    def test_standard_product_api_allows_creation_below_limit(self):
        self.activate_plan(self.free)
        self.create_products(9)

        response = self.client.post(
            "/api/products/",
            self.standard_product_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )
        self.assertEqual(self.vendor.products.count(), 10)

    def test_standard_product_api_blocks_creation_at_limit(self):
        self.activate_plan(self.free)
        self.create_products(10)

        response = self.client.post(
            "/api/products/",
            self.standard_product_payload(),
            format="json",
        )

        self.assert_limit_error(response, 10)
        self.assertEqual(self.vendor.products.count(), 10)

    def test_vendor_dashboard_api_allows_creation_below_limit(self):
        self.activate_plan(self.free)
        self.create_products(9)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_product_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )
        self.assertEqual(self.vendor.products.count(), 10)

    def test_vendor_dashboard_api_blocks_creation_at_limit(self):
        self.activate_plan(self.free)
        self.create_products(10)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_product_payload(),
            format="json",
        )

        self.assert_limit_error(response, 10)
        self.assertEqual(self.vendor.products.count(), 10)

    def test_standard_plan_uses_its_own_product_limit(self):
        self.activate_plan(self.standard)
        self.create_products(50)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_product_payload(),
            format="json",
        )

        self.assert_limit_error(response, 50)

    def test_advanced_plan_allows_products_beyond_free_limit(self):
        self.activate_plan(self.advanced)
        self.create_products(10)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_product_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )
        self.assertEqual(self.vendor.products.count(), 11)
