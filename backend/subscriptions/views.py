from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from subscriptions.models import SubscriptionPlan, VendorSubscription
from subscriptions.serializers import *
from subscriptions.services import *


def get_vendor_for_user(user):
    """
    Resolve the authenticated user's vendor profile.

    This assumes Vendor has a foreign key or one-to-one relation
    named 'user'. Adjust this function if your model uses another name.
    """
    from vendor.models import Vendor

    return Vendor.objects.filter(user=user).first()


class SubscriptionPlansView(APIView):
    permission_classes = []

    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True).order_by(
            "monthly_price"
        )

        return Response(
            SubscriptionPlanSerializer(plans, many=True).data
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
            VendorSubscriptionSerializer(subscriptions, many=True).data
        )


class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

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
                {"detail": "plan_code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            subscription = change_subscription_plan(vendor, plan_code.strip())
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if subscription.status == VendorSubscription.Status.PENDING:
            return Response(
                {
                    "message": (
                        "Subscription request created. Payment verification "
                        "is required before activation."
                    ),
                    "subscription": VendorSubscriptionSerializer(
                        subscription
                    ).data,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        return Response(
            {
                "message": "Subscription activated.",
                "subscription": VendorSubscriptionSerializer(
                    subscription
                ).data,
            },
            status=status.HTTP_200_OK,
        )