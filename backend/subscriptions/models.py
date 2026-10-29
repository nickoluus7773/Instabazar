from django.db import models
from django.utils import timezone


class SubscriptionPlan(models.Model):
    class PlanCode(models.TextChoices):
        FREE = "free", "Free"
        STANDARD = "standard", "Standard"
        ADVANCED = "advanced", "Advanced"

    code = models.CharField(
        max_length=20,
        choices=PlanCode.choices,
        unique=True,
    )

    name = models.CharField(max_length=50)

    monthly_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
    )

    # None means unlimited products.
    max_products = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    analytics_level = models.CharField(
        max_length=20,
        choices=[
            ("basic", "Basic"),
            ("standard", "Standard"),
            ("advanced", "Advanced"),
        ],
        default="basic",
    )

    instagram_redirect = models.BooleanField(default=False)
    product_badges = models.BooleanField(default=False)
    ai_tools = models.BooleanField(default=False)
    bazaar_choice = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["monthly_price"]

    def __str__(self):
        return f"{self.name} - ₹{self.monthly_price}/month"


class VendorSubscription(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"

    vendor = models.ForeignKey(
        "vendor.Vendor",
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    starts_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    payment_reference = models.CharField(
        max_length=255,
        blank=True,
    )
    razorpay_order_id = models.CharField(
    max_length=100,
    unique=True,
    null=True,
    blank=True, 
    )

    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor", "status"]),
            models.Index(fields=["expires_at"]),
        ]

    @property
    def days_remaining(self):
        if not self.expires_at:
            return None
        now = timezone.now()
        if self.expires_at <= now:
            return 0
        diff = self.expires_at - now
        return max(0, diff.days + (1 if diff.seconds > 0 else 0))

    
    @property
    def is_current(self):
        now = timezone.now()
        return (
            self.status == self.Status.ACTIVE
            and self.plan.is_active
            and self.starts_at is not None
            and self.starts_at <= now
            and (
                self.expires_at is None
                or self.expires_at > now
            )
        )
    def __str__(self):
        return f"{self.vendor.business_name} - {self.plan.name}"