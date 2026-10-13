
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
)
from vendor.models import Vendor


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
