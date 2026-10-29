from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from products.serializers import ProductSerializer
from subscriptions.services import vendor_can_be_followed
from .models import Vendor, VendorFollow

def _is_vendor(user):
    return Vendor.objects.filter(user=user).exists()


def _require_customer(user):
    if _is_vendor(user):
        raise PermissionDenied("Customer accounts only.")


def _require_vendor(user):
    if not _is_vendor(user):
        raise PermissionDenied("Vendor accounts only.")


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def customer_follows(request):
    _require_customer(request.user)
    if request.method == "GET":
        follows = VendorFollow.objects.filter(
            customer=request.user,
            vendor__verification_status="verified",
        ).select_related("vendor")
        return Response([
            {
                "vendor_id": follow.vendor_id,
                "vendor_name": follow.vendor.business_name,
                "store_slug": follow.vendor.store_slug,
                "is_following": True,
            }
            for follow in follows
        ])

    try:
        vendor_id = int(request.data.get("vendor_id"))
    except (TypeError, ValueError):
        return Response({"detail": "A valid vendor_id is required."}, status=400)

    with transaction.atomic():
        vendor = Vendor.objects.select_for_update().filter(
            pk=vendor_id,
            verification_status="verified",
        ).first()
        if vendor is None:
            return Response({"detail": "Vendor not found."}, status=404)
        if not vendor_can_be_followed(vendor):
            return Response({"detail": "This vendor is not eligible for follows."}, status=403)
        _, created = VendorFollow.objects.get_or_create(
            customer=request.user,
            vendor=vendor,
        )
        if created:
            vendor.follower_count = VendorFollow.objects.filter(vendor=vendor, customer__vendor_profile__isnull=True).count()
            vendor.save(update_fields=["follower_count"])

    return Response(
        {"vendor_id": vendor.pk, "is_following": True},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def customer_unfollow(request, vendor_id):
    _require_customer(request.user)
    deleted, _ = VendorFollow.objects.filter(customer=request.user, vendor_id=vendor_id).delete()
    if deleted:
        count = VendorFollow.objects.filter(vendor_id=vendor_id, customer__vendor_profile__isnull=True).count()
        Vendor.objects.filter(pk=vendor_id).update(follower_count=count)
    return Response(status=status.HTTP_204_NO_CONTENT)


class FeedPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 36


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def personal_feed(request):
    _require_customer(request.user)
    eligible_vendor_ids = [
        follow.vendor_id
        for follow in VendorFollow.objects.filter(
            customer=request.user,
            vendor__verification_status="verified",
        ).select_related("vendor")
        if vendor_can_be_followed(follow.vendor)
    ]
    products = Product.objects.filter(
        vendor_id__in=eligible_vendor_ids,
        vendor__verification_status="verified",
        is_active=True,
    ).select_related("vendor", "category").order_by("-createdAt", "-pk")
    paginator = FeedPagination()
    page = paginator.paginate_queryset(products, request)
    return paginator.get_paginated_response(ProductSerializer(page, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vendor_followers(request):
    _require_vendor(request.user)
    vendor = Vendor.objects.get(user=request.user)
    follows = VendorFollow.objects.filter(
        vendor=vendor,
        customer__vendor_profile__isnull=True,
    ).select_related("customer").order_by("-created_at")
    eligible = vendor_can_be_followed(vendor)
    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(follows, request)
    results = [
        {
            "id": follow.customer_id,
            "username": follow.customer.get_username(),
            "followed_at": follow.created_at,
        }
        for follow in page
    ]
    response = paginator.get_paginated_response(results)
    response.data["eligible"] = eligible
    return response
