from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class VerificationStatus(models.TextChoices):
    PENDING = "pending",_("Pending")
    VERIFIED = "verified", _("Verified")
    REJECTED = "rejected", _("Rejected")


class Vendor(models.Model):

    # Identity

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor_profile",
    )

    # Business Information

    business_name = models.CharField(
        max_length=200,
        db_index=True,
    )

    instagram_handle = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    location = models.CharField(
        max_length=200,
        blank=True,
        null=True,
    )

    bio = models.TextField(
        blank=True,
        null=True,
    )

    # Social Metrics

    follower_count = models.PositiveIntegerField(
        default=0,
    )

    # Verification & Moderation

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
        db_index=True,
    )

    subscription_plan = models.CharField(
        max_length=20,
        choices=[("free", "Free"), ("paid", "Premium")],
        default="free",
    )

    # # Subscription / Plan Mapping

    # plan = models.ForeignKey(
    #     "subscriptions.VendorPlan",
    #     on_delete=models.PROTECT,
    #     related_name="vendors",
    # )

    # Storefront

    store_slug = models.SlugField(
        max_length=150,
        unique=True,
    )

    logo_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
    )

    profile_image = models.ImageField(
        upload_to="vendor_profiles/",
        blank=True,
        null=True,
    )

    # Audit

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.business_name

    class Meta:
        db_table = "vendor"

        indexes = [
            models.Index(fields=["verification_status"]),
            models.Index(fields=["business_name"]),
            models.Index(fields=["created_at"]),
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.business_name}"