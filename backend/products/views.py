from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from subscriptions.services import can_add_product, get_product_limit
from vendor.models import Vendor

from .models import Product, WishlistItem
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Product.objects.select_related("vendor")

        if self.action in ["list", "retrieve"]:
            return queryset.filter(is_active=True)

        if not self.request.user.is_authenticated:
            return Product.objects.none()

        return queryset.filter(vendor__user=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        vendor = Vendor.objects.select_for_update().filter(
            user=self.request.user
        ).first()

        if vendor is None:
            raise PermissionDenied(
                "You must have a vendor profile to create products."
            )

        if not can_add_product(vendor):
            limit = get_product_limit(vendor)

            raise PermissionDenied({
                "success": False,
                "message": (
                    f"Your current subscription allows a maximum of "
                    f"{limit} products. Upgrade your plan to add more."
                ),
                "code": "PRODUCT_LIMIT_REACHED",
                "product_limit": limit,
                "upgrade_required": True,
            })

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
    