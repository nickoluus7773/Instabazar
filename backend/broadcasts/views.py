from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from subscriptions.models import SubscriptionPlan
from vendor.models import Vendor
from .models import Broadcast, BroadcastClick, BroadcastRecipient
from .serializers import BroadcastSerializer, ClickSerializer
from .services import broadcast_entitlement, monthly_usage, publish_broadcast, require_customer, require_vendor


class BroadcastPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 36


def vendor_queryset(vendor):
    return Broadcast.objects.filter(vendor=vendor).annotate(
        recipient_count=Count("recipients", distinct=True),
        read_count=Count("recipients", filter=Q(recipients__is_read=True), distinct=True),
        product_click_count=Count("clicks", filter=Q(clicks__click_type="product"), distinct=True),
        storefront_click_count=Count("clicks", filter=Q(clicks__click_type="storefront"), distinct=True),
    ).select_related("vendor", "product")


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def broadcast_list(request):
    vendor = require_vendor(request.user)
    broadcast_entitlement(vendor)
    if request.method == "GET":
        qs = vendor_queryset(vendor)
        if request.query_params.get("status") in dict(Broadcast.Status.choices):
            qs = qs.filter(status=request.query_params["status"])
        paginator = BroadcastPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(BroadcastSerializer(page, many=True, context={"request": request}).data)
    serializer = BroadcastSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    broadcast = serializer.save(vendor=vendor)
    return Response(BroadcastSerializer(vendor_queryset(vendor).get(pk=broadcast.pk), context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def broadcast_detail(request, pk):
    vendor = require_vendor(request.user)
    broadcast_entitlement(vendor)
    broadcast = vendor_queryset(vendor).filter(pk=pk).first()
    if not broadcast:
        raise NotFound("Broadcast not found.")
    if request.method == "GET":
        return Response(BroadcastSerializer(broadcast, context={"request": request}).data)
    if broadcast.status != Broadcast.Status.DRAFT:
        raise ValidationError("Only drafts can be edited or deleted.")
    if request.method == "DELETE":
        broadcast.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = BroadcastSerializer(broadcast, data=request.data, partial=True, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def publish(request, pk):
    vendor = require_vendor(request.user)
    broadcast = Broadcast.objects.filter(pk=pk, vendor=vendor).first()
    if not broadcast:
        raise NotFound("Broadcast not found.")
    published = publish_broadcast(broadcast, vendor)
    return Response(BroadcastSerializer(vendor_queryset(vendor).get(pk=published.pk), context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def archive(request, pk):
    vendor = require_vendor(request.user)
    broadcast_entitlement(vendor)
    updated = Broadcast.objects.filter(pk=pk, vendor=vendor, status=Broadcast.Status.PUBLISHED).update(status=Broadcast.Status.ARCHIVED, updated_at=timezone.now())
    if not updated:
        raise NotFound("Published broadcast not found.")
    return Response(BroadcastSerializer(vendor_queryset(vendor).get(pk=pk), context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics(request):
    vendor = require_vendor(request.user)
    plan = broadcast_entitlement(vendor)
    usage = monthly_usage(vendor)
    qs = vendor_queryset(vendor).filter(status__in=[Broadcast.Status.PUBLISHED, Broadcast.Status.ARCHIVED])
    aggregate = qs.aggregate(recipient_total=Count("recipients", distinct=True), reads=Count("recipients", filter=Q(recipients__is_read=True), distinct=True),
                             product_clicks=Count("clicks", filter=Q(clicks__click_type="product"), distinct=True), storefront_clicks=Count("clicks", filter=Q(clicks__click_type="storefront"), distinct=True))
    limit = plan.max_broadcasts_per_month
    return Response({"plan": plan.code, "monthly_limit": limit, "published_this_month": usage,
                     "remaining": None if limit is None else max(0, limit - usage),
                     "recipients": aggregate["recipient_total"], "reads": aggregate["reads"],
                     "product_clicks": aggregate["product_clicks"], "storefront_clicks": aggregate["storefront_clicks"],
                     "broadcasts": BroadcastSerializer(qs, many=True, context={"request": request}).data})


def customer_queryset(user):
    return Broadcast.objects.filter(recipients__customer=user, status__in=[Broadcast.Status.PUBLISHED, Broadcast.Status.ARCHIVED]).annotate(
        is_read=Count("recipients", filter=Q(recipients__customer=user, recipients__is_read=True))
    ).select_related("vendor", "product").order_by("-published_at", "-pk")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def feed(request):
    require_customer(request.user)
    qs = customer_queryset(request.user)
    paginator = BroadcastPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(BroadcastSerializer(page, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications(request):
    require_customer(request.user)
    recipients = BroadcastRecipient.objects.filter(customer=request.user, broadcast__status__in=[Broadcast.Status.PUBLISHED, Broadcast.Status.ARCHIVED]).select_related("broadcast", "broadcast__vendor").order_by("-delivered_at")
    unread = recipients.filter(is_read=False).count()
    recent = recipients[:8]
    return Response({"unread_count": unread, "results": [
        {"broadcast_id": r.broadcast_id, "title": r.broadcast.title, "vendor_name": r.broadcast.vendor.business_name,
         "delivered_at": r.delivered_at, "is_read": r.is_read}
        for r in recent
    ]})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    require_customer(request.user)
    recipient = BroadcastRecipient.objects.filter(customer=request.user, broadcast_id=pk).first()
    if not recipient:
        raise NotFound("Delivered broadcast not found.")
    if not recipient.is_read:
        recipient.is_read = True
        recipient.read_at = timezone.now()
        recipient.save(update_fields=["is_read", "read_at"])
    return Response({"is_read": True, "read_at": recipient.read_at})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def click(request, pk):
    require_customer(request.user)
    serializer = ClickSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    broadcast = Broadcast.objects.filter(pk=pk, recipients__customer=request.user, status__in=[Broadcast.Status.PUBLISHED, Broadcast.Status.ARCHIVED]).first()
    if not broadcast:
        raise NotFound("Delivered broadcast not found.")
    click_type = serializer.validated_data["click_type"]
    if click_type == BroadcastClick.ClickType.PRODUCT and not broadcast.product_id:
        raise ValidationError("This broadcast has no product attachment.")
    BroadcastClick.objects.create(broadcast=broadcast, customer=request.user, click_type=click_type)
    return Response(status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def products(request):
    vendor = require_vendor(request.user)
    broadcast_entitlement(vendor)
    items = Product.objects.filter(vendor=vendor, is_active=True).order_by("productTitle")
    return Response([{"id": p.pk, "title": p.productTitle, "price": str(p.productPrice), "image": request.build_absolute_uri(p.productImage.url) if p.productImage else None} for p in items])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def eligibility(request):
    vendor = require_vendor(request.user)
    try:
        plan = broadcast_entitlement(vendor)
        limit = plan.max_broadcasts_per_month
        used = monthly_usage(vendor)
        return Response({"eligible": True, "plan": plan.code, "limit": limit, "used": used, "remaining": None if limit is None else max(0, limit - used),
                         "follower_count": vendor.customer_follows.filter(customer__vendor_profile__isnull=True).count()})
    except PermissionDenied as exc:
        return Response({"eligible": False, "detail": str(exc), "limit": 0, "used": 0, "remaining": 0}, status=200)
