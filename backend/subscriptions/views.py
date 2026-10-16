
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from subscriptions.models import SubscriptionPlan, VendorSubscription
from subscriptions.serializers import (
    SubscriptionPlanSerializer,
    VendorSubscriptionSerializer,
)
from subscriptions.services import (
    change_subscription_plan,
    get_current_subscription,
    get_effective_plan,
    activate_paid_subscription,
)
from vendor.models import Vendor

from decimal import Decimal
import razorpay
from django.conf import settings
from rest_framework.exceptions import APIException


def get_vendor_for_user(user):
    """Return the authenticated user's vendor profile, if present."""
    return Vendor.objects.filter(user=user).first()


class SubscriptionPlansView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        plans = SubscriptionPlan.objects.filter(
            is_active=True
        ).order_by("monthly_price")

        return Response(
            SubscriptionPlanSerializer(plans, many=True).data,
            status=status.HTTP_200_OK,
        )


class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor = get_vendor_for_user(request.user)

        if vendor is None:
            return Response(
                {"detail": "Vendor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        subscription = get_current_subscription(vendor)
        plan = get_effective_plan(vendor)

        return Response({
            "plan": SubscriptionPlanSerializer(plan).data,
            "subscription": (
                VendorSubscriptionSerializer(subscription).data
                if subscription else None
            ),
        })


class SubscriptionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor = get_vendor_for_user(request.user)

        if vendor is None:
            return Response(
                {"detail": "Vendor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        subscriptions = (
            VendorSubscription.objects
            .filter(vendor=vendor)
            .select_related("plan")
            .order_by("-created_at")
        )

        return Response(
            VendorSubscriptionSerializer(
                subscriptions,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )


class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        vendor = get_vendor_for_user(request.user)

        if vendor is None:
            return Response(
                {"detail": "Vendor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        plan_code = request.data.get("plan_code")

        if not isinstance(plan_code, str) or not plan_code.strip():
            return Response(
                {"detail": "A valid plan_code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            subscription = change_subscription_plan(
                vendor,
                plan_code.strip().lower(),
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if subscription is None:
            return Response(
                {
                    "message": "Your account is already on the Free plan.",
                    "plan_code": "free",
                },
                status=status.HTTP_200_OK,
            )

        serialized_subscription = VendorSubscriptionSerializer(
            subscription
        ).data

        if subscription.status == VendorSubscription.Status.PENDING:
            return Response(
                {
                    "message": (
                        "Subscription request created. Payment verification "
                        "is required before activation."
                    ),
                    "subscription": serialized_subscription,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        return Response(
            {
                "message": "Subscription request processed.",
                "subscription": serialized_subscription,
            },
            status=status.HTTP_200_OK,
        )

class CreatePaymentOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vendor = get_vendor_for_user(request.user)

        if vendor is None:
            return Response(
                {"detail": "Vendor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return Response(
                {"detail": "Payment gateway is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        subscription_id = request.data.get("subscription_id")

        try:
            subscription = VendorSubscription.objects.select_related(
                "plan"
            ).get(
                pk=subscription_id,
                vendor=vendor,
                status=VendorSubscription.Status.PENDING,
            )
        except (VendorSubscription.DoesNotExist, TypeError, ValueError):
            return Response(
                {"detail": "Pending subscription not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        plan = subscription.plan

        if not plan.is_active or plan.monthly_price <= 0:
            return Response(
                {"detail": "This plan cannot be purchased."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = int(plan.monthly_price * Decimal("100"))

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:
            # Reuse an existing order when one has already been created.
            if subscription.razorpay_order_id:
                existing_order = client.order.fetch(
                    subscription.razorpay_order_id
                )

                if (
                    existing_order["amount"] != amount
                    or existing_order["currency"] != "INR"
                ):
                    return Response(
                        {"detail": "Existing payment order does not match the plan."},
                        status=status.HTTP_409_CONFLICT,
                    )

                order = existing_order
            else:
                order = client.order.create({
                    "amount": amount,
                    "currency": "INR",
                    "receipt": f"subscription_{subscription.pk}",
                    "notes": {
                        "subscription_id": str(subscription.pk),
                        "vendor_id": str(vendor.pk),
                        "plan_code": plan.code,
                    },
                })

                subscription.razorpay_order_id = order["id"]
                subscription.save(
                    update_fields=["razorpay_order_id", "updated_at"]
                )

        except Exception:
            # Log the full exception on the server in production.
            return Response(
                {"detail": "Could not create or retrieve the payment order."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_id": order["id"],
            "amount": amount,
            "currency": "INR",
            "plan_name": plan.name,
            "subscription_id": subscription.pk,
        })


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vendor = get_vendor_for_user(request.user)

        if vendor is None:
            return Response(
                {"detail": "Vendor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        subscription_id = request.data.get("subscription_id")
        payment_id = request.data.get("razorpay_payment_id")
        order_id = request.data.get("razorpay_order_id")
        signature = request.data.get("razorpay_signature")

        if not all(
            isinstance(value, str) and value.strip()
            for value in (payment_id, order_id, signature)
        ):
            return Response(
                {"detail": "Payment verification details are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            subscription = VendorSubscription.objects.select_related(
                "plan"
            ).get(pk=subscription_id, vendor=vendor)
        except (VendorSubscription.DoesNotExist, TypeError, ValueError):
            return Response(
                {"detail": "Subscription not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Make verification safe to retry after a successful activation.
        if (
            subscription.status == VendorSubscription.Status.ACTIVE
            and subscription.payment_reference == payment_id
            and subscription.razorpay_order_id == order_id
        ):
            return Response({
                "message": "Payment has already been verified.",
                "subscription": VendorSubscriptionSerializer(
                    subscription
                ).data,
            })

        if subscription.status != VendorSubscription.Status.PENDING:
            return Response(
                {"detail": "Subscription is not pending payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Never trust an order ID supplied by the browser unless it
        # matches the order recorded for this vendor's subscription.
        if not subscription.razorpay_order_id or (
            order_id != subscription.razorpay_order_id
        ):
            return Response(
                {"detail": "Payment order does not match this subscription."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return Response(
                {"detail": "Payment gateway is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": subscription.razorpay_order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {"detail": "Payment signature verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = client.payment.fetch(payment_id)
        except Exception:
            return Response(
                {"detail": "Could not verify payment status with Razorpay."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        expected_amount = int(
            subscription.plan.monthly_price * Decimal("100")
        )

        if (
            payment.get("order_id") != subscription.razorpay_order_id
            or payment.get("amount") != expected_amount
            or payment.get("currency") != "INR"
            or payment.get("status") != "captured"
        ):
            return Response(
                {
                    "detail": (
                        "Payment is not captured or does not match "
                        "the expected subscription amount."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            subscription = activate_paid_subscription(
                subscription,
                payment_id,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "message": "Payment verified and subscription activated.",
            "subscription": VendorSubscriptionSerializer(
                subscription
            ).data,
        }, status=status.HTTP_200_OK)