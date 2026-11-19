from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("subscriptions", "0005_set_broadcast_plan_quotas")]
    operations = [
        migrations.RemoveField(
            model_name="subscriptionplan",
            name="ai_tools",
        ),
    ]
