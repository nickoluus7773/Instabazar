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

    productImage = models.TextField()

    productStock = models.IntegerField(default=0)

    productSize = models.CharField(max_length=20, blank=True)

    productCondition = models.CharField(max_length=50)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )

    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.productTitle