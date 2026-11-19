from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("subscriptions", "0003_vendorsubscription_cancelled_at_and_more")]
    operations = [migrations.AddField(
        model_name="subscriptionplan", name="max_broadcasts_per_month",
        field=models.PositiveIntegerField(blank=True, default=0, help_text="Monthly broadcast limit. Zero disables broadcasts; blank is unlimited.", null=True),
    )]
