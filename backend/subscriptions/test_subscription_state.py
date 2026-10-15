
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


from rest_framework.test import APITestCase
from rest_framework import status

from products.models import Product, Category


class ProductSubscriptionLimitTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.free = SubscriptionPlan.objects.create(
            code="free",
            name="Free",
            monthly_price=Decimal("0.00"),
            max_products=10,
            analytics_level="basic",
            instagram_redirect=False,
            is_active=True,
        )
        cls.standard = SubscriptionPlan.objects.create(
            code="standard",
            name="Standard",
            monthly_price=Decimal("149.00"),
            max_products=50,
            analytics_level="standard",
            instagram_redirect=True,
            is_active=True,
        )
        cls.advanced = SubscriptionPlan.objects.create(
            code="advanced",
            name="Advanced",
            monthly_price=Decimal("249.00"),
            max_products=None,
            analytics_level="advanced",
            instagram_redirect=True,
            is_active=True,
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="product_limit_user",
            password="test-password-123",
        )
        self.vendor = Vendor.objects.create(
            user=self.user,
            business_name="Product Limit Store",
            store_slug="product-limit-store",
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

        
    def standard_payload(self):
        return {
            "productTitle": "New Test Product",
            "productDescription": "A test product",
            "productPrice": "199.00",
            "productStock": 5,
            "productCondition": "New",
            "category": self.category.categoryName,
        }


    def vendor_payload(self):
        return {
            "title": "New Test Product",
            "description": "A test product",
            "price": "199.00",
            "stock": 5,
            "condition": "New",
            "category": self.category.categoryName,
        }


    def assert_limit_error(self, response, expected_limit):
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
            response.data,
        )

        self.assertEqual(
            str(response.data["code"]),
            "PRODUCT_LIMIT_REACHED",
        )

        self.assertEqual(
            int(response.data["product_limit"]),
            expected_limit,
        )

        self.assertTrue(response.data["upgrade_required"])

    def test_standard_api_blocks_product_at_free_limit(self):
        self.activate_plan(self.free)
        self.create_products(10)

        response = self.client.post(
            "/api/products/",
            self.standard_payload(),
            format="json",
        )

        self.assert_limit_error(response, 10)
        self.assertEqual(self.vendor.products.count(), 10)

    def test_vendor_api_blocks_product_at_free_limit(self):
        self.activate_plan(self.free)
        self.create_products(10)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_payload(),
            format="json",
        )

        self.assert_limit_error(response, 10)
        self.assertEqual(self.vendor.products.count(), 10)

    def test_vendor_api_allows_product_below_free_limit(self):
        self.activate_plan(self.free)
        self.create_products(9)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )
        self.assertEqual(self.vendor.products.count(), 10)

    def test_standard_plan_enforces_its_own_limit(self):
        self.activate_plan(self.standard)
        self.create_products(50)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_payload(),
            format="json",
        )

        self.assert_limit_error(response, 50)

    def test_advanced_plan_allows_more_than_free_limit(self):
        self.activate_plan(self.advanced)
        self.create_products(10)

        response = self.client.post(
            "/api/vendor/products/",
            self.vendor_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )
        self.assertEqual(self.vendor.products.count(), 11)
