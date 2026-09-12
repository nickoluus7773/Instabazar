from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Product, WishlistItem
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.all()

    serializer_class = ProductSerializer

    permission_classes = [AllowAny]


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
    