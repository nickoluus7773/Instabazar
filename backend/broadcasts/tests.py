from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from products.models import Category, Product
from subscriptions.models import SubscriptionPlan, VendorSubscription
from vendor.models import Vendor, VendorFollow
from .models import BroadcastRecipient


class BroadcastApiTests(TestCase):
    def setUp(self):
        self.standard = SubscriptionPlan.objects.create(
            code="standard", name="Standard", monthly_price=149, max_broadcasts_per_month=0,
        )
        self.advanced = SubscriptionPlan.objects.create(
            code="advanced", name="Advanced", monthly_price=249, max_broadcasts_per_month=20,
        )
        self.free = SubscriptionPlan.objects.create(
            code="free", name="Free", monthly_price=0, max_broadcasts_per_month=0,
        )
        self.vendor_user = User.objects.create_user("seller", password="pass")
        self.vendor = Vendor.objects.create(user=self.vendor_user, business_name="Shop", store_slug="shop", verification_status="verified")
        VendorSubscription.objects.create(vendor=self.vendor, plan=self.advanced, status="active", starts_at=timezone.now()-timedelta(days=1))
        self.customer = User.objects.create_user("customer", password="pass")
        self.other_customer = User.objects.create_user("other", password="pass")
        self.client = APIClient()

    def test_publish_snapshots_only_current_customer_followers_once(self):
        VendorFollow.objects.create(vendor=self.vendor, customer=self.customer)
        draft = self.client.post("/api/login/", {"username": "seller", "password": "pass"}, format="json").data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {draft['access']}")
        created = self.client.post("/api/broadcasts/", {"title": "New range", "message": "Now available"}, format="json")
        self.assertEqual(created.status_code, 201)
        first = self.client.post(f"/api/broadcasts/{created.data['id']}/publish/", {}, format="json")
        second = self.client.post(f"/api/broadcasts/{created.data['id']}/publish/", {}, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 400)
        self.assertEqual(BroadcastRecipient.objects.filter(broadcast_id=created.data["id"]).count(), 1)
        analytics = self.client.get("/api/broadcasts/analytics/")
        self.assertEqual(analytics.status_code, 200)
        self.assertEqual(analytics.data["recipients"], 1)

    def test_customer_feed_only_contains_delivered_broadcasts_and_read_is_private(self):
        VendorFollow.objects.create(vendor=self.vendor, customer=self.customer)
        vendor_token = self.client.post("/api/login/", {"username": "seller", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {vendor_token}")
        created = self.client.post("/api/broadcasts/", {"title": "Update", "message": "Message"}, format="json")
        self.client.post(f"/api/broadcasts/{created.data['id']}/publish/", {}, format="json")
        customer_token = self.client.post("/api/login/", {"username": "customer", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")
        feed = self.client.get("/api/broadcasts/feed/")
        self.assertEqual(feed.status_code, 200)
        self.assertEqual(feed.data["count"], 1)
        denied = self.client.post(f"/api/broadcasts/{created.data['id']}/read/", {}, format="json")
        self.assertEqual(denied.status_code, 200)
        other_token = self.client.post("/api/login/", {"username": "other", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}")
        self.assertEqual(self.client.post(f"/api/broadcasts/{created.data['id']}/read/", {}, format="json").status_code, 404)

    def test_product_attachment_must_belong_to_authenticated_vendor(self):
        category = Category.objects.create(categoryName="Clothes")
        other_user = User.objects.create_user("seller2", password="pass")
        other_vendor = Vendor.objects.create(user=other_user, business_name="Other", store_slug="other", verification_status="verified")
        product = Product.objects.create(vendor=other_vendor, productTitle="Item", productDescription="Description", productPrice=10, productCondition="New", category=category)
        token = self.client.post("/api/login/", {"username": "seller", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post("/api/broadcasts/", {"title": "Update", "message": "Message", "product": product.pk}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_expired_advanced_subscription_cannot_publish(self):
        token = self.client.post("/api/login/", {"username": "seller", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        draft = self.client.post("/api/broadcasts/", {"title": "Update", "message": "Message"}, format="json")
        subscription = self.vendor.subscriptions.first()
        subscription.expires_at = timezone.now() - timedelta(days=3)
        subscription.save(update_fields=["expires_at"])
        response = self.client.post(f"/api/broadcasts/{draft.data['id']}/publish/", {}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_standard_vendor_cannot_access_broadcast_management(self):
        user = User.objects.create_user("standard_seller", password="pass")
        vendor = Vendor.objects.create(user=user, business_name="Standard Shop", store_slug="standard-shop", verification_status="verified")
        VendorSubscription.objects.create(vendor=vendor, plan=self.standard, status="active", starts_at=timezone.now()-timedelta(days=1))
        token = self.client.post("/api/login/", {"username": "standard_seller", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(self.client.get("/api/broadcasts/").status_code, 403)
        self.assertEqual(self.client.get("/api/broadcasts/products/").status_code, 403)
        self.assertEqual(self.client.get("/api/broadcasts/analytics/").status_code, 403)
        self.assertEqual(self.client.post("/api/broadcasts/", {"title": "Update", "message": "Message"}, format="json").status_code, 403)

        free_user = User.objects.create_user("free_seller", password="pass")
        Vendor.objects.create(user=free_user, business_name="Free Shop", store_slug="free-shop", verification_status="verified")
        free_token = self.client.post("/api/login/", {"username": "free_seller", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {free_token}")
        self.assertEqual(self.client.get("/api/broadcasts/").status_code, 403)
        self.assertEqual(self.client.post("/api/broadcasts/", {"title": "Update", "message": "Message"}, format="json").status_code, 403)

    def test_monthly_limit_is_enforced_at_publish(self):
        token = self.client.post("/api/login/", {"username": "seller", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        for index in range(20):
            draft = self.client.post("/api/broadcasts/", {"title": f"Update {index}", "message": "Message"}, format="json")
            self.assertEqual(draft.status_code, 201)
            self.assertEqual(self.client.post(f"/api/broadcasts/{draft.data['id']}/publish/", {}, format="json").status_code, 200)
        twenty_first = self.client.post("/api/broadcasts/", {"title": "Update 21", "message": "Message"}, format="json")
        self.assertEqual(self.client.post(f"/api/broadcasts/{twenty_first.data['id']}/publish/", {}, format="json").status_code, 403)

    def test_broadcast_remains_in_history_after_customer_unfollows(self):
        VendorFollow.objects.create(vendor=self.vendor, customer=self.customer)
        token = self.client.post("/api/login/", {"username": "seller", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        draft = self.client.post("/api/broadcasts/", {"title": "Update", "message": "Message"}, format="json")
        self.client.post(f"/api/broadcasts/{draft.data['id']}/publish/", {}, format="json")
        VendorFollow.objects.filter(vendor=self.vendor, customer=self.customer).delete()
        customer_token = self.client.post("/api/login/", {"username": "customer", "password": "pass"}, format="json").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")
        response = self.client.get("/api/broadcasts/feed/")
        self.assertEqual(response.data["count"], 1)
