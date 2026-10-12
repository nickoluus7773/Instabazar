from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, wishlist, wishlist_item

router = DefaultRouter()

router.register(
    "products",
    ProductViewSet
)

urlpatterns = router.urls
urlpatterns += [
    path("wishlist/", wishlist, name="wishlist"),
    path("wishlist/<int:product_id>/", wishlist_item, name="wishlist-item"),
]