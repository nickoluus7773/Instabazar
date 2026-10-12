from datetime import timedelta

from django.db import transaction
from django.db import models
from django.utils import timezone

from subscriptions.models import SubscriptionPlan, VendorSubscription


def get_free_plan():
    """Return the configured Free plan."""
    try:
        return SubscriptionPlan.objects.get(
            code="free",
            is_active=True,
        )
    except SubscriptionPlan.DoesNotExist:
        raise ValueError(
            "The Free subscription plan has not been configured."
        )

def get_current_subscription(vendor):
    now = timezone.now()

    return (
        VendorSubscription.objects
        .filter(
            vendor=vendor,
            status=VendorSubscription.Status.ACTIVE,
            starts_at__lte=now,
        )
        .filter(
            models.Q(expires_at__isnull=True)
            | models.Q(expires_at__gt=now)
        )
        .select_related("plan")
        .order_by("-created_at")
        .first()
    )

def get_effective_plan(vendor):
    """
    Return the plan the vendor is currently entitled to use.

    If no valid subscription exists, fall back to Free.
    """
    subscription = get_current_subscription(vendor)

    if subscription:
        return subscription.plan

    return get_free_plan()

def vendor_has_feature(vendor, feature_name):
    """
    Check whether the vendor's effective plan includes a feature.
    """
    allowed_features = {
        "instagram_redirect",
        "product_badges",
        "ai_tools",
        "bazaar_choice",
    }

    if feature_name not in allowed_features:
        raise ValueError(f"Unknown subscription feature: {feature_name}")

    plan = get_effective_plan(vendor)
    return bool(getattr(plan, feature_name))

def get_product_limit(vendor):
    """Return the product limit, or None for unlimited."""
    plan = get_effective_plan(vendor)
    return plan.max_products


def can_add_product(vendor):
    """
    Check whether a vendor can add another product.

    Existing products are not deleted when a plan is downgraded.
    """
    product_limit = get_product_limit(vendor)

    if product_limit is None:
        return True

    current_count = vendor.products.count()

    return current_count < product_limit


@transaction.atomic
def request_subscription(vendor, plan_code):
    """
    Create a subscription request.

    Free subscriptions can activate immediately.
    Paid subscriptions remain pending until payment is verified.
    """
    try:
        plan = SubscriptionPlan.objects.get(
            code=plan_code,
            is_active=True,
        )
    except SubscriptionPlan.DoesNotExist:
        raise ValueError("The selected subscription plan is unavailable.")

    if plan.code == "free":
        existing = get_current_subscription(vendor)

        if existing and existing.plan.code == "free":
            return existing

        return VendorSubscription.objects.create(
            vendor=vendor,
            plan=plan,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=timezone.now(),
            expires_at=None,
        )

    return VendorSubscription.objects.create(
        vendor=vendor,
        plan=plan,
        status=VendorSubscription.Status.PENDING,
    )


@transaction.atomic
def activate_paid_subscription(subscription, payment_reference):
    """
    Activate a paid subscription after trusted payment verification.

    IMPORTANT:
    Call this only after the payment gateway confirms payment.
    Do not expose this function through an unprotected API endpoint.
    """
    subscription = (
        VendorSubscription.objects
        .select_for_update()
        .select_related("plan", "vendor")
        .get(pk=subscription.pk)
    )

    if subscription.status != VendorSubscription.Status.PENDING:
        raise ValueError("This subscription is not pending payment.")

    if subscription.plan.monthly_price <= 0:
        raise ValueError("Only paid plans can use paid activation.")

    now = timezone.now()

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
    Mark subscriptions as expired when their expiry date has passed.

    Can later be scheduled using a periodic task.
    """
    now = timezone.now()

    return VendorSubscription.objects.filter(
        status=VendorSubscription.Status.ACTIVE,
        expires_at__lte=now,
    ).update(
        status=VendorSubscription.Status.EXPIRED,
        updated_at=now,
    )

@transaction.atomic
def change_subscription_plan(vendor, plan_code):
    """
    Request a plan change without granting unverified paid benefits.

    Free plan requests activate immediately.
    Paid plan requests remain pending until payment is verified.
    """
    try:
        plan = SubscriptionPlan.objects.get(
            code=plan_code,
            is_active=True,
        )
    except SubscriptionPlan.DoesNotExist:
        raise ValueError("The selected subscription plan is unavailable.")

    current_subscription = get_current_subscription(vendor)

    if current_subscription and current_subscription.plan.code == plan.code:
        raise ValueError("You are already subscribed to this plan.")

    if plan.code == "free":
        free_plan = get_free_plan()

        return VendorSubscription.objects.create(
            vendor=vendor,
            plan=free_plan,
            status=VendorSubscription.Status.ACTIVE,
            starts_at=timezone.now(),
            expires_at=None,
        )

    return VendorSubscription.objects.create(
        vendor=vendor,
        plan=plan,
        status=VendorSubscription.Status.PENDING,
    )