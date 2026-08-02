from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase


class VendorRegistrationTests(APITestCase):
    def test_vendor_registration_creates_user_and_vendor_profile(self):
        url = reverse("register-vendor")
        payload = {
            "username": "vendoruser",
            "email": "vendor@example.com",
            "password": "password123",
            "business_name": "Glow Boutique",
            "instagram_handle": "@glow",
            "location": "Lagos",
            "bio": "A stylish boutique",
            "logo_url": "https://example.com/logo.png",
            "subscription_plan": "paid",
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="vendoruser").exists())

        user = User.objects.get(username="vendoruser")
        self.assertTrue(hasattr(user, "vendor_profile"))
        self.assertEqual(user.vendor_profile.business_name, "Glow Boutique")
        self.assertEqual(user.vendor_profile.verification_status, "pending")
        self.assertEqual(user.vendor_profile.store_slug, "glow-boutique")
