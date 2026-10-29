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

    # Nullable so existing listings remain readable until their vendor updates them.
    instagram_post_url = models.URLField(max_length=500, blank=True, null=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )

    createdAt = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.productImage:
            try:
                import shutil
                from pathlib import Path
                from django.conf import settings
                src_path = Path(self.productImage.path)
                if src_path.exists():
                    dest_dir = settings.BASE_DIR.parent / "frontend" / "public" / "images"
                    dest_dir.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src_path, dest_dir / src_path.name)
            except Exception:
                pass

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
