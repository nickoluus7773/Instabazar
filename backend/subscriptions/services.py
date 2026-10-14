from datetime import timedelta

from django.db import models, transaction
from django.utils import timezone

from subscriptions.models import SubscriptionPlan, VendorSubscription
from vendor.models import Vendor


def get_free_plan():
    try:
        return SubscriptionPlan.objects.get(
            code=SubscriptionPlan.PlanCode.FREE,
            is_active=True,
        )
    except SubscriptionPlan.DoesNotExist as exc:
        raise ValueError(
            "The active Free subscription plan has not been configured."
        ) from exc


def get_current_subscription(vendor):
    now = timezone.now()

    return (
        VendorSubscription.objects.filter(
            vendor=vendor,
            status=VendorSubscription.Status.ACTIVE,
            starts_at__lte=now,
        )
        .filter(
            models.Q(expires_at__isnull=True)
            | models.Q(expires_at__gt=now)
        )
        .filter(plan__is_active=True)
        .select_related("plan")
        .order_by("-created_at", "-pk")
        .first()
    )


def get_effective_plan(vendor):
    subscription = get_current_subscription(vendor)

    if subscription and subscription.plan.is_active:
        return subscription.plan

    return get_free_plan()


def vendor_has_feature(vendor, feature_name):
    allowed_features = {
        "instagram_redirect",
        "product_badges",
        "ai_tools",
        "bazaar_choice",
    }

    if feature_name not in allowed_features:
        raise ValueError(f"Unknown subscription feature: {feature_name}")

    return bool(getattr(get_effective_plan(vendor), feature_name))


def get_product_limit(vendor):
    return get_effective_plan(vendor).max_products


def can_add_product(vendor):
    limit = get_product_limit(vendor)

    if limit is None:
        return True

    return vendor.products.count() < limit


@transaction.atomic
def change_subscription_plan(vendor, plan_code):
    # Serialize plan-change requests for this vendor.
    Vendor.objects.select_for_update().get(pk=vendor.pk)

    try:
        plan = SubscriptionPlan.objects.get(
            code=plan_code,
            is_active=True,
        )
    except SubscriptionPlan.DoesNotExist as exc:
        raise ValueError("Invalid or inactive subscription plan.") from exc

    current = get_current_subscription(vendor)

    if current and current.plan_id == plan.id:
        raise ValueError("You are already subscribed to this plan.")

    if plan.code == SubscriptionPlan.PlanCode.FREE:
        if current and current.plan.monthly_price > 0:
            raise ValueError(
                "Your paid subscription remains active until it expires."
            )

        # A previous paid request must not be activated after the vendor
        # explicitly selects Free again.
        VendorSubscription.objects.filter(
            vendor=vendor,
            status=VendorSubscription.Status.PENDING,
        ).update(status=VendorSubscription.Status.CANCELLED)
        return None

    # Keep only one pending plan choice valid for this vendor. Otherwise an
    # older pending payment could later replace the plan the vendor chose last.
    VendorSubscription.objects.filter(
        vendor=vendor,
        status=VendorSubscription.Status.PENDING,
    ).exclude(plan=plan).update(status=VendorSubscription.Status.CANCELLED)

    # Reuse a pending request for the selected plan rather than duplicating it.
    pending = VendorSubscription.objects.filter(
        vendor=vendor,
        plan=plan,
        status=VendorSubscription.Status.PENDING,
    ).order_by("-created_at").first()

    if pending:
        return pending

    return VendorSubscription.objects.create(
        vendor=vendor,
        plan=plan,
        status=VendorSubscription.Status.PENDING,
    )


@transaction.atomic
def activate_paid_subscription(subscription, payment_reference):
    """
    Internal operation only.

    Call this only after a trusted payment-provider verification.
    Never expose it through an unauthenticated or user-controlled endpoint.
    """
    if not payment_reference or not payment_reference.strip():
        raise ValueError("A verified payment reference is required.")

    # Lock the vendor first in both plan selection and activation to maintain
    # a consistent lock order for concurrent subscription operations.
    vendor_id = VendorSubscription.objects.values_list(
        "vendor_id", flat=True
    ).get(pk=subscription.pk)
    Vendor.objects.select_for_update().get(pk=vendor_id)

    subscription = (
        VendorSubscription.objects.select_for_update()
        .select_related("plan")
        .get(pk=subscription.pk)
    )

    if subscription.status != VendorSubscription.Status.PENDING:
        raise ValueError("Only pending subscriptions can be activated.")

    if not subscription.plan.is_active:
        raise ValueError("This subscription plan is no longer available.")

    if subscription.plan.monthly_price <= 0:
        raise ValueError("Only paid plans can be activated here.")

    if VendorSubscription.objects.filter(
        payment_reference=payment_reference.strip()
    ).exclude(pk=subscription.pk).exists():
        raise ValueError("This payment reference has already been used.")

    now = timezone.now()

    # Prevent multiple overlapping active subscriptions.
    VendorSubscription.objects.filter(
        vendor_id=subscription.vendor_id,
        status=VendorSubscription.Status.ACTIVE,
    ).exclude(pk=subscription.pk).update(
        status=VendorSubscription.Status.CANCELLED
    )

    subscription.status = VendorSubscription.Status.ACTIVE
    subscription.starts_at = now
    subscription.expires_at = now + timedelta(days=30)
    subscription.payment_reference = payment_reference.strip()
    subscription.save(
        update_fields=[
            "status",
            "starts_at",
            "expires_at",
            "payment_reference",
            "updated_at",
        ]
    )

    return subscription


def expire_old_subscriptions():
    now = timezone.now()

    return VendorSubscription.objects.filter(
        status=VendorSubscription.Status.ACTIVE,
        expires_at__isnull=False,
        expires_at__lte=now,
    ).update(status=VendorSubscription.Status.EXPIRED)