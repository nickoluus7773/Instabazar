
from django.urls import path

from .views import (
    PublicVendorDetailView,
    PublicVendorListView,
    public_vendor_instagram_redirect,
)

urlpatterns = [
    path(
        "",
        PublicVendorListView.as_view({"get": "list"}),
        name="public-vendor-list",
    ),
    path(
        "<slug:store_slug>/instagram/",
        public_vendor_instagram_redirect,
        name="public-vendor-instagram-redirect",
    ),
    path(
        "<slug:store_slug>/",
        PublicVendorDetailView.as_view({"get": "retrieve"}),
        name="public-vendor-detail",
    ),
]
