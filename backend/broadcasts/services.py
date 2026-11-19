from datetime import datetime, time

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from subscriptions.models import SubscriptionPlan
from subscriptions.services import get_current_subscription
from products.models import Product
from vendor.models import Vendor, VendorFollow
from .models import Broadcast, BroadcastRecipient


def require_vendor(user):
    try:
        return user.vendor_profile
    except Vendor.DoesNotExist as exc:
        raise PermissionDenied("Vendor accounts only.") from exc


def require_customer(user):
    if Vendor.objects.filter(user=user).exists():
        raise PermissionDenied("Customer accounts only.")


def broadcast_entitlement(vendor):
    if vendor.verification_status != "verified":
        raise PermissionDenied("Your store must be verified to use broadcasts.")
    subscription = get_current_subscription(vendor)
    if not subscription or subscription.plan.code != SubscriptionPlan.PlanCode.ADVANCED:
        raise PermissionDenied("An active Advanced subscription is required to access Bazaar Broadcasts.")
    return subscription.plan


def month_start(value=None):
    value = value or timezone.now()
    local_value = timezone.localtime(value)
    return timezone.make_aware(datetime.combine(local_value.date().replace(day=1), time.min))


def monthly_usage(vendor, now=None):
    start = month_start(now)
    return Broadcast.objects.filter(
        vendor=vendor, status__in=[Broadcast.Status.PUBLISHED, Broadcast.Status.ARCHIVED],
        published_at__gte=start,
    ).count()


@transaction.atomic
def publish_broadcast(broadcast, vendor):
    Vendor.objects.select_for_update().get(pk=vendor.pk)
    # Lock only the broadcast row here. Joining the nullable product relation
    # under FOR UPDATE is rejected by PostgreSQL.
    broadcast = Broadcast.objects.select_for_update().get(pk=broadcast.pk, vendor=vendor)
    if broadcast.status != Broadcast.Status.DRAFT:
        raise ValidationError("Only drafts can be published.")
    plan = broadcast_entitlement(vendor)
    limit = plan.max_broadcasts_per_month
    if limit is not None and monthly_usage(vendor) >= limit:
        raise PermissionDenied("Your monthly broadcast limit has been reached.")
    if broadcast.product_id:
        try:
            product = Product.objects.select_for_update().get(pk=broadcast.product_id)
        except Product.DoesNotExist as exc:
            raise ValidationError({"product": "The attached product no longer exists."}) from exc
        if product.vendor_id != vendor.pk or not product.is_active:
            raise ValidationError({"product": "Choose an active product from your own catalog."})

    customer_ids = VendorFollow.objects.filter(
        vendor=vendor, customer__vendor_profile__isnull=True,
    ).values_list("customer_id", flat=True)
    now = timezone.now()
    broadcast.status = Broadcast.Status.PUBLISHED
    broadcast.published_at = now
    broadcast.save(update_fields=["status", "published_at", "updated_at"])
    BroadcastRecipient.objects.bulk_create(
        [BroadcastRecipient(broadcast=broadcast, customer_id=customer_id, delivered_at=now)
         for customer_id in customer_ids],
        ignore_conflicts=True,
    )
    return broadcast
