from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT Authentication
    path("api/login/", TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),

    # User APIs
    path("api/", include("users.urls")),

    # Vendor APIs
    path("api/vendor/", include("vendor.urls")),
    path("api/vendors/", include("vendor.public_urls")),

    # Product APIs
    path("api/", include("products.urls")),

    # Reviews
    path("api/", include("reviews.urls")),
]