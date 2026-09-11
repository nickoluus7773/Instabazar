from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorViewSet,
    PublicVendorListView,
    PublicVendorDetailView,
)

router = DefaultRouter()
router.register(r'', VendorViewSet, basename='vendor')

urlpatterns = [
    # Public endpoints
    path(
        "public/",
        PublicVendorListView.as_view({"get": "list"}),
        name="public-vendor-list",
    ),
    path(
        "public/<slug:store_slug>/",
        PublicVendorDetailView.as_view({"get": "retrieve"}),
        name="public-vendor-detail",
    ),

    # Authenticated vendor endpoints
    path('profile/', VendorViewSet.as_view({'get': 'profile'}), name='vendor-profile'),
    path('profile/update/', VendorViewSet.as_view({'put': 'profile_update', 'patch': 'profile_update'}), name='vendor-profile-update'),
    path('stats/', VendorViewSet.as_view({'get': 'stats'}), name='vendor-stats'),
    path('products/', VendorViewSet.as_view({'get': 'products', 'post': 'create_product'}), name='vendor-products'),
    path('products/<int:product_id>/', VendorViewSet.as_view({
        'get': 'product_detail',
        'put': 'product_detail',
        'patch': 'product_detail',
        'delete': 'product_detail',
    }), name='vendor-product-detail'),
    path('', include(router.urls)),
]