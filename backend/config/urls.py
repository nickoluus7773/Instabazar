from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from users.custom_auth import CustomTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT Authentication (supports username or email, case-insensitive)
    path("api/login/", CustomTokenObtainPairView.as_view()),
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
    path("subscriptions/", include("subscriptions.urls")),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)