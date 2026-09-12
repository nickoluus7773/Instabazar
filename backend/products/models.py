from django.db import models
from vendor.models import Vendor


class Category(models.Model):
    categoryName = models.CharField(max_length=100)

    def __str__(self):
        return self.categoryName


class Product(models.Model):
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="products"
    )

    productTitle = models.CharField(max_length=255)

    productDescription = models.TextField()

    productPrice = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    productImage = models.ImageField(
        upload_to="products/",
        max_length=500,
        blank=True,
    )

    productStock = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)

    productSize = models.CharField(max_length=20, blank=True)

    productCondition = models.CharField(max_length=50)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )

    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.productTitle


class WishlistItem(models.Model):
    user = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                name="unique_user_wishlist_product",
            )
        ]
        ordering = ["-createdAt"]

    def __str__(self):
        return f"{self.user.username}: {self.product.productTitle}"