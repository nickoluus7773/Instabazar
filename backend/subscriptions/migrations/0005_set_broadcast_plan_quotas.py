from django.db import migrations


def set_broadcast_quotas(apps, schema_editor):
    SubscriptionPlan = apps.get_model("subscriptions", "SubscriptionPlan")
    SubscriptionPlan.objects.filter(code="free").update(max_broadcasts_per_month=0)
    SubscriptionPlan.objects.filter(code="standard").update(max_broadcasts_per_month=0)
    SubscriptionPlan.objects.filter(code="advanced").update(max_broadcasts_per_month=20)


class Migration(migrations.Migration):
    dependencies = [("subscriptions", "0004_subscriptionplan_max_broadcasts_per_month")]
    operations = [migrations.RunPython(set_broadcast_quotas, migrations.RunPython.noop)]
