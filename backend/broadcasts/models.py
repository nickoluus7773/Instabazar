from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone


def validate_image_size(image):
    if image.size > 5 * 1024 * 1024:
        from django.core.exceptions import ValidationError
        raise ValidationError("Broadcast images must be 5 MB or smaller.")


class Broadcast(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    vendor = models.ForeignKey("vendor.Vendor", on_delete=models.CASCADE, related_name="broadcasts")
    title = models.CharField(max_length=120)
    message = models.TextField(max_length=2000)
    image = models.ImageField(
        upload_to="broadcasts/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"]), validate_image_size],
    )
    product = models.ForeignKey(
        "products.Product", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="broadcasts",
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-pk"]
        indexes = [models.Index(fields=["vendor", "status", "published_at"])]

    def __str__(self):
        return f"{self.title} ({self.vendor.business_name})"


class BroadcastRecipient(models.Model):
    broadcast = models.ForeignKey(Broadcast, on_delete=models.CASCADE, related_name="recipients")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="broadcast_recipients")
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["broadcast", "customer"], name="unique_broadcast_recipient")]
        indexes = [models.Index(fields=["customer", "is_read", "delivered_at"])]


class BroadcastClick(models.Model):
    class ClickType(models.TextChoices):
        PRODUCT = "product", "Product"
        STOREFRONT = "storefront", "Storefront"

    broadcast = models.ForeignKey(Broadcast, on_delete=models.CASCADE, related_name="clicks")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="broadcast_clicks")
    click_type = models.CharField(max_length=12, choices=ClickType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["broadcast", "click_type"])]
