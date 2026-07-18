from django.urls import path

from .views import PublicVendorDetailView, PublicVendorListView

urlpatterns = [
    path("", PublicVendorListView.as_view({"get": "list"}), name="public-vendor-list"),
    path("<slug:store_slug>/", PublicVendorDetailView.as_view({"get": "retrieve"}), name="public-vendor-detail"),
]
