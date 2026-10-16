from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0009_wishlistitem"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="instagram_post_url",
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
    ]
