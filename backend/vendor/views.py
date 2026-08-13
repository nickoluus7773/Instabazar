from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Q
from .models import Vendor
from .serializers import VendorSerializer, VendorDetailSerializer


class PublicVendorListView(viewsets.ReadOnlyModelViewSet):
    """Read-only storefront API for vendors approved in Django admin."""
    permission_classes = [AllowAny]
    serializer_class = VendorSerializer
    lookup_field = "store_slug"

    def get_queryset(self):
        return Vendor.objects.filter(
            verification_status="verified"
        ).annotate(product_count=Count("products"))


class PublicVendorDetailView(PublicVendorListView):
    serializer_class = VendorDetailSerializer

class VendorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for vendor operations.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = VendorSerializer

    def get_queryset(self):
        """Return vendor profile for the current user"""
        return Vendor.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'update' or self.action == 'partial_update':
            return VendorDetailSerializer
        return VendorSerializer

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current vendor's profile"""
        try:
            vendor = Vendor.objects.get(user=request.user)
            serializer = VendorDetailSerializer(vendor)
            return Response(serializer.data)
        except Vendor.DoesNotExist:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['put', 'patch'])
    def profile_update(self, request):
        """Update current vendor's profile"""
        try:
            vendor = Vendor.objects.get(user=request.user)
            serializer = VendorDetailSerializer(vendor, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Vendor.DoesNotExist:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get vendor statistics"""
        try:
            vendor = Vendor.objects.get(user=request.user)
            stats = {
                "total_products": vendor.products.count(),
                "total_views": 2304,
                "total_favorites": 128,
                "total_orders": 17,
                "average_rating": 4.8,
                "max_products": 50,
            }
            return Response(stats)
        except Vendor.DoesNotExist:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def products(self, request):
        """Get vendor's products with pagination"""
        try:
            vendor = Vendor.objects.get(user=request.user)
            products = vendor.products.all()
            
            # Pagination
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            start = (page - 1) * page_size
            end = start + page_size
            
            from products.serializers import ProductSerializer
            serializer = ProductSerializer(products[start:end], many=True)
            
            return Response({
                "count": products.count(),
                "page": page,
                "page_size": page_size,
                "results": serializer.data
            })
        except Vendor.DoesNotExist:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def create_product(self, request):
        """Create a new product"""
        try:
            vendor = Vendor.objects.get(user=request.user)
            from products.models import Product, Category
            from products.serializers import ProductSerializer

            title = request.data.get("title") or request.data.get("productTitle")
            if not title:
                return Response({"error": "Product title is required"}, status=status.HTTP_400_BAD_REQUEST)

            description = request.data.get("description") or request.data.get("productDescription") or ""
            price = request.data.get("price") or request.data.get("productPrice") or "0"
            stock = int(request.data.get("stock") or request.data.get("productStock") or 1)
            category_raw = request.data.get("category") or "Clothing"
            category_name = category_raw.title() if isinstance(category_raw, str) else "Clothing"
            condition = request.data.get("condition") or request.data.get("productCondition") or "New"
            size = request.data.get("size") or request.data.get("productSize") or "Standard"
            image_url = request.data.get("image_url") or request.data.get("productImage") or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"

            category_obj, _ = Category.objects.get_or_create(categoryName=category_name)

            product = Product.objects.create(
                vendor=vendor,
                productTitle=title,
                productDescription=description,
                productPrice=price,
                productStock=stock,
                category=category_obj,
                productCondition=condition,
                productSize=size,
                productImage=image_url,
            )

            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Vendor.DoesNotExist:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
