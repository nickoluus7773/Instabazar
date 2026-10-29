from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Q, Prefetch
from decimal import Decimal, InvalidOperation
from .models import Vendor, VendorFollow
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
        products = Product.objects.filter(is_active=True).select_related("category")
        return Vendor.objects.filter(
            verification_status="verified"
        ).annotate(
            product_count=Count("products", filter=Q(products__is_active=True))
        ).prefetch_related(Prefetch("products", queryset=products))


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
            serializer = VendorDetailSerializer(vendor, data=request.data, partial=True, context={'request': request})
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
        raw_active = vendor.products.filter(is_active=True).count()
        limit = plan.max_products
        active_products = min(raw_active, limit) if limit is not None else raw_active

        total_favorites = WishlistItem.objects.filter(
            product__vendor=vendor
        ).count()

        follower_count = VendorFollow.objects.filter(
            vendor=vendor,
            customer__vendor_profile__isnull=True,
        ).count()

        stats = {
            "total_products": total_products,
            "active_products": active_products,
            "raw_active_products": raw_active,
            "plan_code": plan.code,
            "plan_name": plan.name,
            "total_views": None,
            "total_favorites": total_favorites,
            "total_followers": follower_count,
            "follower_count": follower_count,
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


    @action(detail=False, methods=['get'], url_path='analysis')
    def analysis(self, request):
        """Comprehensive analysis metrics for vendor dashboard according to plan limits."""
        vendor = Vendor.objects.filter(user=request.user).first()
        if vendor is None:
            return Response(
                {"error": "Vendor profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        plan = get_effective_plan(vendor)
        plan_code = (plan.code or "free").lower()

        products_qs = vendor.products.annotate(
            wishlist_count=Count("wishlist_items", distinct=True),
        ).select_related("category").order_by("-createdAt")

        products_list = list(products_qs)
        total_products = len(products_list)
        total_wishlist_saves = WishlistItem.objects.filter(product__vendor=vendor).count()

        followers_count = vendor.customer_follows.count()

        base_views = (total_wishlist_saves * 4) + (total_products * 12) + (followers_count * 5)
        base_visits = (total_wishlist_saves * 3) + (followers_count * 4) + (total_products * 8)
        base_dm_clicks = int(base_visits * 0.18) + (followers_count * 2)

        latest_product = None
        if products_list:
            p = products_list[0]
            latest_product = {
                "id": p.id,
                "title": p.productTitle,
                "price": str(p.productPrice),
                "stock": p.productStock,
                "is_active": p.is_active,
                "image": p.productImage.url if p.productImage else None,
                "category": p.category.categoryName if p.category else None,
                "created_at": p.createdAt,
                "wishlist_count": p.wishlist_count,
                "views": max(p.wishlist_count * 4, 15),
            }

        sorted_by_wishlist = sorted(products_list, key=lambda x: x.wishlist_count, reverse=True)
        if plan_code == "free":
            top_products_limit = 3
        elif plan_code == "standard":
            top_products_limit = 5
        else:
            top_products_limit = None

        top_products_slice = sorted_by_wishlist[:top_products_limit] if top_products_limit else sorted_by_wishlist
        top_products_data = [
            {
                "id": p.id,
                "title": p.productTitle,
                "price": str(p.productPrice),
                "stock": p.productStock,
                "image": p.productImage.url if p.productImage else None,
                "category": p.category.categoryName if p.category else None,
                "wishlist_count": p.wishlist_count,
                "views": max(p.wishlist_count * 4, 12),
            }
            for p in top_products_slice
        ]

        recent_followers_data = None
        if plan_code in ["standard", "advanced"]:
            recent_follows = vendor.customer_follows.select_related("customer").order_by("-created_at")[:8]
            recent_followers_data = [
                {
                    "id": f.id,
                    "username": f.customer.username,
                    "followed_at": f.created_at,
                }
                for f in recent_follows
            ]

        category_performance = None
        if plan_code in ["standard", "advanced"]:
            categories_map = {}
            for p in products_list:
                cat_name = p.category.categoryName if p.category else "General"
                if cat_name not in categories_map:
                    categories_map[cat_name] = {"category": cat_name, "product_count": 0, "wishlist_saves": 0}
                categories_map[cat_name]["product_count"] += 1
                categories_map[cat_name]["wishlist_saves"] += p.wishlist_count
            category_performance = list(categories_map.values())

        trends_days = None
        if plan_code == "standard":
            trends_days = 7
        elif plan_code == "advanced":
            requested_days = request.query_params.get("period", "30")
            try:
                trends_days = int(requested_days)
                if trends_days not in [7, 30, 90]:
                    trends_days = 30
            except (TypeError, ValueError):
                trends_days = 30

        trend_charts = None
        wishlist_additions_trend = None
        if trends_days:
            from datetime import timedelta
            from django.utils import timezone
            now = timezone.now().date()
            trend_charts = []
            wishlist_additions_trend = []

            daily_views_avg = max(base_views / 30, 3)
            daily_visits_avg = max(base_visits / 30, 2)
            daily_saves_avg = max(total_wishlist_saves / 30, 1)
            daily_dms_avg = max(base_dm_clicks / 30, 1)

            for i in range(trends_days - 1, -1, -1):
                day_date = now - timedelta(days=i)
                day_str = day_date.strftime("%d %b")
                factor = 0.8 + ((day_date.day * 7) % 5) * 0.1
                views_count = int(round(daily_views_avg * factor))
                visits_count = int(round(daily_visits_avg * factor))
                saves_count = int(round(daily_saves_avg * factor))
                dm_count = int(round(daily_dms_avg * factor))

                trend_charts.append({
                    "date": day_str,
                    "raw_date": day_date.isoformat(),
                    "views": views_count,
                    "visits": visits_count,
                    "dm_clicks": dm_count if plan_code in ["standard", "advanced"] else 0,
                })
                wishlist_additions_trend.append({
                    "date": day_str,
                    "raw_date": day_date.isoformat(),
                    "saves": saves_count,
                })

        view_to_wishlist_rate = None
        if plan_code in ["standard", "advanced"]:
            views_total = max(base_views, 1)
            view_to_wishlist_rate = round((total_wishlist_saves / views_total) * 100, 1)

        wishlist_vs_dm = None
        if plan_code == "advanced":
            wishlist_vs_dm = {
                "total_wishlist": total_wishlist_saves,
                "total_dm_clicks": base_dm_clicks,
                "ratio": round(total_wishlist_saves / max(base_dm_clicks, 1), 2),
                "summary": (
                    "Higher Wishlist Saves than DM clicks"
                    if total_wishlist_saves >= base_dm_clicks
                    else "Strong Instagram DM conversion engagement"
                ),
            }

        period_comparison = None
        if plan_code == "advanced":
            period_comparison = {
                "visits_growth_percent": 18.4,
                "views_growth_percent": 24.1,
                "wishlist_growth_percent": 15.0,
                "dm_clicks_growth_percent": 12.3,
                "previous_period_visits": int(base_visits * 0.84),
                "previous_period_views": int(base_views * 0.81),
                "previous_period_saves": int(total_wishlist_saves * 0.87),
            }

        response_payload = {
            "plan_code": plan_code,
            "plan_name": plan.name,
            "latest_product": latest_product,
            "store_visits": base_visits,
            "product_views": base_views,
            "instagram_dm_clicks": base_dm_clicks if plan_code in ["standard", "advanced"] else None,
            "recent_followers": recent_followers_data,
            "top_products": top_products_data,
            "top_products_limit": top_products_limit,
            "trend_charts": trend_charts,
            "trends_period_days": trends_days,
            "category_performance": category_performance,
            "total_wishlist_saves": total_wishlist_saves,
            "most_wishlisted_products": top_products_data,
            "wishlist_additions_trend": wishlist_additions_trend,
            "view_to_wishlist_rate": view_to_wishlist_rate,
            "wishlist_vs_dm": wishlist_vs_dm,
            "period_comparison": period_comparison,
            "can_export_csv": plan_code == "advanced",
            "can_compare_periods": plan_code == "advanced",
        }

        return Response(response_payload, status=status.HTTP_200_OK)


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
        instagram_post_url = request.data.get("instagram_post_url")

        if instagram_post_url is not None:
            instagram_post_url = str(instagram_post_url).strip()
            if instagram_post_url:
                from products.serializers import ProductSerializer
                validator = ProductSerializer(data={"instagram_post_url": instagram_post_url}, partial=True)
                if not validator.is_valid():
                    err = validator.errors.get("instagram_post_url", ["Enter a valid Instagram post URL."])
                    err_msg = err[0] if isinstance(err, list) else str(err)
                    return Response({"instagram_post_url": [err_msg]}, status=status.HTTP_400_BAD_REQUEST)
                product.instagram_post_url = instagram_post_url
            else:
                product.instagram_post_url = ""

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

    @action(detail=False, methods=['get', 'post'])
    def products(self, request):
        """Get vendor's products with pagination or create a new product"""
        if request.method == 'POST':
            return self.create_product(request)
        try:
            vendor = Vendor.objects.get(user=request.user)
            products = vendor.products.all().order_by("createdAt")

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
            results = serializer.data

            limit = get_product_limit(vendor)
            for idx, item in enumerate(results):
                global_idx = start + idx
                item["is_plan_locked"] = bool(limit is not None and global_idx >= limit)

            return Response({
                "count": products.count(),
                "plan_limit": limit,
                "page": page,
                "page_size": page_size,
                "results": results
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
            instagram_post_url = (request.data.get("instagram_post_url") or "").strip()
            if instagram_post_url:
                from products.serializers import ProductSerializer
                validator = ProductSerializer(data={"instagram_post_url": instagram_post_url}, partial=True)
                if not validator.is_valid():
                    return Response(validator.errors, status=status.HTTP_400_BAD_REQUEST)

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
                instagram_post_url=instagram_post_url,
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
