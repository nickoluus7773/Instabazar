
from datetime import datetime, time, timedelta

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


def get_subscription_access_cutoff(expires_at):
    """
    Return the exact time when subscription benefits stop.

    Benefits remain available until 12:00 PM on the calendar
    day following the expires_at date, using Django's current timezone.

    Example:
        expires_at: February 1
        access cutoff: February 2 at 12:00 PM
    """
    if expires_at is None:
        return None

    local_expiry = timezone.localtime(expires_at)
    cutoff_date = local_expiry.date() + timedelta(days=1)

    cutoff_naive = datetime.combine(
        cutoff_date,
        time(hour=12, minute=0),
    )

    return timezone.make_aware(
        cutoff_naive,
        timezone.get_current_timezone(),
    )


def is_subscription_access_valid(subscription, now=None):
    """
    Check whether a subscription currently grants its plan benefits.
    """
    if now is None:
        now = timezone.now()

    if subscription.status != VendorSubscription.Status.ACTIVE:
        return False

    if subscription.starts_at and subscription.starts_at > now:
        return False

    if not subscription.plan.is_active:
        return False

    cutoff = get_subscription_access_cutoff(subscription.expires_at)

    return cutoff is None or now < cutoff


def get_current_subscription(vendor):
    """
    Return the newest subscription that currently grants benefits.

    The grace-period cutoff is enforced here, independently of
    the scheduled expiry command.
    """
    now = timezone.now()

    subscriptions = (
        VendorSubscription.objects.filter(
            vendor=vendor,
            status=VendorSubscription.Status.ACTIVE,
            starts_at__lte=now,
            plan__is_active=True,
        )
        .select_related("plan")
        .order_by("-created_at", "-pk")
    )

    for subscription in subscriptions:
        if is_subscription_access_valid(subscription, now):
            return subscription

    return None


def get_effective_plan(vendor):
    subscription = get_current_subscription(vendor)

    if subscription:
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
        raise ValueError(
            "Invalid or inactive subscription plan."
        ) from exc

    current = get_current_subscription(vendor)

    # Free is the fallback plan. Selecting it again should be harmless.
    if plan.code == SubscriptionPlan.PlanCode.FREE:
        # Do not cancel a paid subscription while it still grants benefits.
        if current and current.plan.monthly_price > 0:
            raise ValueError(
                "Your paid subscription remains active until it expires."
            )

        # Cancel outstanding requests so they cannot later replace Free.
        VendorSubscription.objects.filter(
            vendor=vendor,
            status=VendorSubscription.Status.PENDING,
        ).update(
            status=VendorSubscription.Status.CANCELLED
        )

        return None

    # Avoid creating another pending request for the current plan.
    if current and current.plan_id == plan.id:
        raise ValueError(
            "You are already subscribed to this plan."
        )

    # Keep only the latest selected paid plan pending.
    VendorSubscription.objects.filter(
        vendor=vendor,
        status=VendorSubscription.Status.PENDING,
    ).exclude(
        plan=plan
    ).update(
        status=VendorSubscription.Status.CANCELLED
    )

    # Reuse an existing pending request for the selected plan.
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

    Call this only after trusted payment-provider verification.
    Never expose it through an unauthenticated or user-controlled endpoint.
    """
    if not payment_reference or not payment_reference.strip():
        raise ValueError("A verified payment reference is required.")

    # Lock the vendor first to maintain a consistent lock order.
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

    payment_reference = payment_reference.strip()

    if VendorSubscription.objects.filter(
        payment_reference=payment_reference
    ).exclude(pk=subscription.pk).exists():
        raise ValueError("This payment reference has already been used.")

    now = timezone.now()

    # Cancel other active subscriptions for this vendor.
    VendorSubscription.objects.filter(
        vendor_id=subscription.vendor_id,
        status=VendorSubscription.Status.ACTIVE,
    ).exclude(pk=subscription.pk).update(
        status=VendorSubscription.Status.CANCELLED
    )

    subscription.status = VendorSubscription.Status.ACTIVE
    subscription.starts_at = now
    subscription.expires_at = now + timedelta(days=30)
    subscription.payment_reference = payment_reference

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
    """
    Mark active subscriptions expired once their grace period ends.

    The same cutoff helper is used by access checks and this command,
    so scheduling delays cannot extend paid access beyond the cutoff.
    """
    now = timezone.now()

    active_subscriptions = VendorSubscription.objects.filter(
        status=VendorSubscription.Status.ACTIVE,
        expires_at__isnull=False,
    ).only(
        "pk",
        "expires_at",
    )

    expired_ids = [
        subscription.pk
        for subscription in active_subscriptions.iterator()
        if get_subscription_access_cutoff(subscription.expires_at) <= now
    ]

    if not expired_ids:
        return 0

    return VendorSubscription.objects.filter(
        pk__in=expired_ids,
        status=VendorSubscription.Status.ACTIVE,
    ).update(
        status=VendorSubscription.Status.EXPIRED
    )
