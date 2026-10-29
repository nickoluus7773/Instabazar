from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from subscriptions.services import can_add_product, get_product_limit
from vendor.models import Vendor

from .models import Product, WishlistItem
from .serializers import ProductSerializer


def get_public_active_product_ids():
    valid_ids = []
    vendors = Vendor.objects.all().prefetch_related("products")
    for v in vendors:
        limit = get_product_limit(v)
        qs = v.products.filter(is_active=True).order_by("createdAt")
        if limit is not None:
            qs = qs[:limit]
        valid_ids.extend(qs.values_list("id", flat=True))
    return valid_ids


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Product.objects.select_related("vendor")

        if self.action == "list":
            return queryset.filter(is_active=True, id__in=get_public_active_product_ids())

        if self.action == "retrieve":
            if self.request.user.is_authenticated and hasattr(self.request.user, "vendor_profile"):
                return queryset.filter(Q(is_active=True) | Q(vendor=self.request.user.vendor_profile))
            return queryset.filter(is_active=True, id__in=get_public_active_product_ids())

        if not self.request.user.is_authenticated:
            return Product.objects.none()

        return queryset.filter(vendor__user=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        vendor = Vendor.objects.select_for_update().filter(
            user=self.request.user
        ).first()

        if vendor is None:
            return Response(
                {"detail": "You must have a vendor profile to create products."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not can_add_product(vendor):
            limit = get_product_limit(vendor)
            return Response(
                {
                    "success": False,
                    "message": (
                        f"Your current subscription allows a maximum of "
                        f"{limit} products. Upgrade your plan to add more."
                    ),
                    "code": "PRODUCT_LIMIT_REACHED",
                    "product_limit": limit,
                    "upgrade_required": True,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(request, *args, **kwargs)

    @transaction.atomic
    def perform_create(self, serializer):
        vendor = Vendor.objects.select_for_update().filter(
            user=self.request.user
        ).first()

        if vendor is None:
            raise PermissionDenied(
                "You must have a vendor profile to create products."
            )

        serializer.save(vendor=vendor)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def wishlist(request):
    if request.method == "GET":
        items = WishlistItem.objects.filter(user=request.user).select_related("product")
        return Response(ProductSerializer([item.product for item in items], many=True).data)

    product_id = request.data.get("product_id")
    try:
        product = Product.objects.get(pk=product_id)
    except (Product.DoesNotExist, TypeError, ValueError):
        return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

    WishlistItem.objects.get_or_create(user=request.user, product=product)
    return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def wishlist_item(request, product_id):
    deleted, _ = WishlistItem.objects.filter(
        user=request.user,
        product_id=product_id,
    ).delete()

    if not deleted:
        return Response({"detail": "Wishlist item not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response(status=status.HTTP_204_NO_CONTENT)
    