from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Q
from decimal import Decimal, InvalidOperation
from .models import Vendor
from .serializers import VendorSerializer, VendorDetailSerializer
from products.models import Product, WishlistItem
from subscriptions.services import (
    can_add_product,
    get_product_limit,
    get_effective_plan,
)
import re

from django.shortcuts import get_object_or_404, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from subscriptions.services import (
    can_add_product,
    get_product_limit,
    vendor_has_feature,
)

@api_view(["GET"])
@permission_classes([AllowAny])
def public_vendor_instagram_redirect(request, store_slug):
    """
    Redirect customers to a vendor's Instagram profile only when
    the vendor's effective subscription allows Instagram redirects.
    """

    vendor = get_object_or_404(
        Vendor,
        store_slug=store_slug,
        verification_status="verified",
    )

    if not vendor_has_feature(vendor, "instagram_redirect"):
        return Response(
            {
                "code": "INSTAGRAM_REDIRECT_UPGRADE_REQUIRED",
                "detail": (
                    "This vendor's subscription does not include "
                    "Instagram redirects."
                ),
                "upgrade_required": True,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    handle = (vendor.instagram_handle or "").strip().lstrip("@")

    # Accept usernames only, not arbitrary URLs.
    if not handle or not re.fullmatch(r"[A-Za-z0-9._]{1,30}", handle):
        return Response(
            {"detail": "This vendor has no valid Instagram handle."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return redirect(f"https://www.instagram.com/{handle}/")


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
        """Return real, plan-aware vendor overview metrics."""

        vendor = Vendor.objects.filter(user=request.user).first()

        if vendor is None:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        plan = get_effective_plan(vendor)
        products = vendor.products.all()

        total_products = products.count()
        active_products = vendor.products.filter(is_active=True).count()

        total_favorites = WishlistItem.objects.filter(
            product__vendor=vendor
        ).count()

        stats = {
            "total_products": total_products,
            "active_products": active_products,
            "total_views": None,
            "total_favorites": total_favorites,
            "total_orders": None,
            "total_revenue": None,
            "average_rating": None,
            "max_products": plan.max_products,
            "analytics_level": plan.analytics_level,
        }

        # Advanced analytics: count distinct users who saved
        # at least one product from this vendor.
        if plan.analytics_level == "advanced":
            stats["total_wishlist_customers"] = (
                WishlistItem.objects.filter(product__vendor=vendor)
                .values("user_id")
                .distinct()
                .count()
            )

        return Response(stats)

    
    @action(detail=False, methods=['get'], url_path='wishlist-analysis')
    def wishlist_analysis(self, request):
        """Return wishlist analytics according to the vendor's plan."""

        vendor = Vendor.objects.filter(user=request.user).first()

        if vendor is None:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        plan = get_effective_plan(vendor)

        # Free plan: basic analytics only.
        if plan.analytics_level == "basic":
            return Response(
                {
                    "code": "ANALYTICS_UPGRADE_REQUIRED",
                    "detail": (
                        "Product-level wishlist analytics require "
                        "the Standard or Advanced plan."
                    ),
                    "required_analytics_level": "standard",
                    "current_analytics_level": plan.analytics_level,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        products = list(
            vendor.products.annotate(
                wishlist_count=Count(
                    "wishlist_items",
                    distinct=True,
                ),
                wishlist_customer_count=Count(
                    "wishlist_items__user",
                    distinct=True,
                ),
            ).order_by(
                "-wishlist_customer_count",
                "productTitle",
            )
        )

        is_advanced = plan.analytics_level == "advanced"

        product_data = [
            {
                "id": product.id,
                "title": product.productTitle,
                "image": (
                    product.productImage.url
                    if product.productImage
                    else None
                ),
                "wishlist_count": product.wishlist_count,
                "customer_count": (
                    product.wishlist_customer_count
                    if is_advanced
                    else None
                ),
            }
            for product in products
        ]

        response_data = {
            "analytics_level": plan.analytics_level,
            "total_wishlist_saves": sum(
                item["wishlist_count"]
                for item in product_data
            ),
            "products": product_data,
        }

        if is_advanced:
            total_customers = (
                WishlistItem.objects.filter(product__vendor=vendor)
                .values("user_id")
                .distinct()
                .count()
            )

            response_data.update({
                "total_customers": total_customers,
                "most_wishlisted_product": (
                    product_data[0]
                    if (
                        product_data
                        and product_data[0]["customer_count"] > 0
                    )
                    else None
                ),
            })
        else:
            response_data.update({
                "total_customers": None,
                "most_wishlisted_product": None,
            })

        return Response(response_data)


    def product_detail(self, request, product_id):
        """Read, update, or remove one product owned by the current vendor."""
        try:
            vendor = Vendor.objects.get(user=request.user)
            product = vendor.products.get(pk=product_id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        from products.serializers import ProductSerializer

        if request.method == "GET":
            return Response(ProductSerializer(product).data)
        if request.method == "DELETE":
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        from products.models import Category

        title = request.data.get("title", request.data.get("productTitle"))
        description = request.data.get("description", request.data.get("productDescription"))
        price = request.data.get("price", request.data.get("productPrice"))
        stock = request.data.get("stock", request.data.get("productStock"))
        is_active = request.data.get("is_active")
        category_name = request.data.get("category")
        condition = request.data.get("condition", request.data.get("productCondition"))
        size = request.data.get("size", request.data.get("productSize"))
        image_file = request.FILES.get("productImage") or request.FILES.get("image")
        image_url = request.data.get("image_url")

        if title is not None:
            if not str(title).strip():
                return Response({"error": "Product title is required"}, status=status.HTTP_400_BAD_REQUEST)
            product.productTitle = title
        if description is not None:
            product.productDescription = description
        if price is not None:
            try:
                product.productPrice = Decimal(str(price))
            except (InvalidOperation, TypeError, ValueError):
                return Response({"error": "A valid price is required"}, status=status.HTTP_400_BAD_REQUEST)
        if stock is not None:
            try:
                product.productStock = int(stock)
            except (TypeError, ValueError):
                return Response({"error": "Stock must be a whole number"}, status=status.HTTP_400_BAD_REQUEST)
        if is_active is not None:
            if isinstance(is_active, str):
                is_active = is_active.lower() in {"true", "1", "yes", "on"}
            product.is_active = bool(is_active)
        if isinstance(category_name, str) and category_name.strip():
            product.category, _ = Category.objects.get_or_create(categoryName=category_name.strip())
        if condition is not None:
            product.productCondition = condition
        if size is not None:
            product.productSize = size
        if image_file:
            product.productImage = image_file
        elif image_url is not None:
            product.productImage = image_url

        product.save()
        return Response(ProductSerializer(product).data)

    @action(detail=False, methods=['get'])
    def products(self, request):
        """Get vendor's products with pagination"""
        try:
            vendor = Vendor.objects.get(user=request.user)
            products = vendor.products.all()

            try:
                page = max(1, int(request.query_params.get('page', 1)))
                page_size = min(100, max(1, int(request.query_params.get('page_size', 10))))
            except (TypeError, ValueError):
                return Response(
                    {"error": "page and page_size must be whole numbers"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
    @transaction.atomic
    @action(detail=False, methods=['post'])
    def create_product(self, request):
        """Create a new product"""
        try:
            vendor = Vendor.objects.select_for_update().get(user=request.user)            
            from products.models import Product, Category
            from products.serializers import ProductSerializer

            title = request.data.get("title") or request.data.get("productTitle")
            if not title:
                return Response({"error": "Product title is required"}, status=status.HTTP_400_BAD_REQUEST)

            description = request.data.get("description") or request.data.get("productDescription") or ""
            price = request.data.get("price") or request.data.get("productPrice") or "0"
            try:
                stock = int(request.data.get("stock") or request.data.get("productStock") or 1)
            except (TypeError, ValueError):
                return Response({"error": "Stock must be a whole number"}, status=status.HTTP_400_BAD_REQUEST)
            category_raw = request.data.get("category") or "Clothing"
            category_name = category_raw.title() if isinstance(category_raw, str) else "Clothing"
            condition = request.data.get("condition") or request.data.get("productCondition") or "New"
            size = request.data.get("size") or request.data.get("productSize") or "Standard"
            image_url = request.data.get("image_url") or request.data.get("productImage") or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
            image_file = request.FILES.get("productImage") or request.FILES.get("image")

            category_obj, _ = Category.objects.get_or_create(categoryName=category_name)

            if not can_add_product(vendor):
                product_limit = get_product_limit(vendor)

                return Response(
                    {
                        "success": False,
                        "message": (
                            f"Your current subscription allows a maximum of "
                            f"{product_limit} products. Upgrade your plan to add more."
                        ),
                        "code": "PRODUCT_LIMIT_REACHED",
                        "product_limit": product_limit,
                        "upgrade_required": True,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            product = Product.objects.create(
                vendor=vendor,
                productTitle=title,
                productDescription=description,
                productPrice=price,
                productStock=stock,
                category=category_obj,
                productCondition=condition,
                productSize=size,
                productImage=image_file or image_url,
            )

            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Vendor.DoesNotExist:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(["GET"])
@permission_classes([AllowAny])
def public_vendor_instagram_redirect(request, store_slug):
    vendor = get_object_or_404(
        Vendor,
        store_slug=store_slug,
        verification_status="verified",
    )

    if not vendor_has_feature(vendor, "instagram_redirect"):
        return Response(
            {
                "code": "INSTAGRAM_REDIRECT_UPGRADE_REQUIRED",
                "detail": (
                    "This vendor's subscription does not include "
                    "Instagram redirects."
                ),
                "upgrade_required": True,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    handle = (vendor.instagram_handle or "").strip().lstrip("@")

    if not handle or not re.fullmatch(r"[A-Za-z0-9._]{1,30}", handle):
        return Response(
            {"detail": "This vendor has no valid Instagram handle."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return redirect(f"https://www.instagram.com/{handle}/")
    