
from datetime import timedelta

from django.db import models, transaction
from django.utils import timezone

from subscriptions.models import SubscriptionPlan, VendorSubscription
from vendor.models import Vendor


def get_free_plan():
    """Return the active Free plan."""
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
    """Return the vendor's most recent valid active subscription."""
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
        .order_by("-created_at", "-pk")
        .first()
    )


def get_effective_plan(vendor):
    """Return the plan currently available to the vendor."""
    subscription = get_current_subscription(vendor)

    if subscription and subscription.plan.is_active:
        return subscription.plan

    return get_free_plan()


def vendor_has_feature(vendor, feature_name):
    """Check access to a subscription-controlled feature."""
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
    return get_effective_plan(vendor).max_products


def can_add_product(vendor):
    """Check whether the vendor can create another product."""
    limit = get_product_limit(vendor)

    if limit is None:
        return True

    return vendor.products.count() < limit


@transaction.atomic
def change_subscription_plan(vendor, plan_code):
    """
    Request a plan change.

    Free is the fallback after a paid subscription expires.
    Paid plans remain pending until payment is verified.
    """
    # Serialize subscription changes for this vendor.
    Vendor.objects.select_for_update().get(pk=vendor.pk)

    try:
        plan = SubscriptionPlan.objects.get(
            code=plan_code,
            is_active=True,
        )
    except SubscriptionPlan.DoesNotExist as exc:
        raise ValueError(
            "The selected subscription plan is unavailable."
        ) from exc

    current = get_current_subscription(vendor)

    if current and current.plan.code == plan.code:
        raise ValueError("You are already subscribed to this plan.")

    if plan.code == SubscriptionPlan.PlanCode.FREE:
        if current and current.plan.monthly_price > 0:
            raise ValueError(
                "Your paid subscription is still active. "
                "Your plan will fall back to Free after it expires."
            )

        # No need to create duplicate Free subscription records.
        return None

    # Reuse an existing pending request for this same plan.
    pending = (
        VendorSubscription.objects
        .filter(
            vendor=vendor,
            plan=plan,
            status=VendorSubscription.Status.PENDING,
        )
        .order_by("-created_at")
        .first()
    )

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
    Activate a paid subscription after trusted payment verification.

    Call this only from trusted backend payment-verification code,
    never directly from a client-facing activation endpoint.
    """
    if not payment_reference or not payment_reference.strip():
        raise ValueError("A verified payment reference is required.")

    subscription = (
        VendorSubscription.objects
        .select_for_update()
        .select_related("plan", "vendor")
        .get(pk=subscription.pk)
    )

    # Prevent replaying an activation for an already-processed request.
    if subscription.status != VendorSubscription.Status.PENDING:
        raise ValueError("This subscription is not pending payment.")

    if subscription.plan.monthly_price <= 0:
        raise ValueError("Only paid plans can use paid activation.")

    # Do not reuse a payment reference for another subscription.
    duplicate_reference = VendorSubscription.objects.filter(
        payment_reference=payment_reference.strip(),
    ).exclude(pk=subscription.pk).exists()

    if duplicate_reference:
        raise ValueError("This payment reference has already been used.")

    # Lock the vendor row so competing subscription changes serialize.
    Vendor.objects.select_for_update().get(pk=subscription.vendor_id)

    now = timezone.now()

    # Only after trusted payment verification, retire other active
    # subscriptions so this vendor has one current active plan.
    VendorSubscription.objects.filter(
        vendor=subscription.vendor,
        status=VendorSubscription.Status.ACTIVE,
    ).exclude(pk=subscription.pk).update(
        status=VendorSubscription.Status.CANCELLED,
        updated_at=now,
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
    """Mark paid subscriptions expired after their expiry time."""
    now = timezone.now()

    return VendorSubscription.objects.filter(
        status=VendorSubscription.Status.ACTIVE,
        expires_at__isnull=False,
        expires_at__lte=now,
    ).update(
        status=VendorSubscription.Status.EXPIRED,
        updated_at=now,
    )
