from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion
import django.utils.timezone
import broadcasts.models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("products", "0010_product_instagram_post_url"),
        ("vendor", "0005_vendorfollow"),
    ]
    operations = [
        migrations.CreateModel(name="Broadcast", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("title", models.CharField(max_length=120)),
            ("message", models.TextField(max_length=2000)),
            ("image", models.ImageField(blank=True, null=True, upload_to="broadcasts/", validators=[django.core.validators.FileExtensionValidator(["jpg", "jpeg", "png", "webp"]), broadcasts.models.validate_image_size])),
            ("status", models.CharField(choices=[("draft", "Draft"), ("published", "Published"), ("archived", "Archived")], default="draft", max_length=12)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("published_at", models.DateTimeField(blank=True, null=True)),
            ("updated_at", models.DateTimeField(auto_now=True)),
            ("product", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="broadcasts", to="products.product")),
            ("vendor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="broadcasts", to="vendor.vendor")),
        ], options={"ordering": ["-created_at", "-pk"]}),
        migrations.CreateModel(name="BroadcastRecipient", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("is_read", models.BooleanField(default=False)),
            ("read_at", models.DateTimeField(blank=True, null=True)),
            ("delivered_at", models.DateTimeField(default=django.utils.timezone.now)),
            ("broadcast", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="recipients", to="broadcasts.broadcast")),
            ("customer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="broadcast_recipients", to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="BroadcastClick", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("click_type", models.CharField(choices=[("product", "Product"), ("storefront", "Storefront")], max_length=12)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("broadcast", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="clicks", to="broadcasts.broadcast")),
            ("customer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="broadcast_clicks", to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.AddConstraint(model_name="broadcastrecipient", constraint=models.UniqueConstraint(fields=("broadcast", "customer"), name="unique_broadcast_recipient")),
        migrations.AddIndex(model_name="broadcast", index=models.Index(fields=["vendor", "status", "published_at"], name="broadcasts__vendor__9cf167_idx")),
        migrations.AddIndex(model_name="broadcastrecipient", index=models.Index(fields=["customer", "is_read", "delivered_at"], name="broadcasts__custome_4a9e31_idx")),
        migrations.AddIndex(model_name="broadcastclick", index=models.Index(fields=["broadcast", "click_type"], name="broadcasts__broadca_4a5a7e_idx")),
    ]
