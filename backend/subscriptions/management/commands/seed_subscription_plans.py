from django.core.management.base import BaseCommand
from subscriptions.models import SubscriptionPlan


class Command(BaseCommand):
    help = "Create or update the default subscription plans"

    def handle(self, *args, **options):
        plans = [
            {
                "code": "free",
                "name": "Free",
                "monthly_price": 0,
                "max_products": 10,
                "analytics_level": "basic",
                "instagram_redirect": False,
                "product_badges": False,
                "ai_tools": False,
                "bazaar_choice": False,
            },
            {
                "code": "standard",
                "name": "Standard",
                "monthly_price": 149,
                "max_products": 50,
                "analytics_level": "standard",
                "instagram_redirect": True,
                "product_badges": True,
                "ai_tools": False,
                "bazaar_choice": False,
            },
            {
                "code": "advanced",
                "name": "Advanced",
                "monthly_price": 249,
                "max_products": None,
                "analytics_level": "advanced",
                "instagram_redirect": True,
                "product_badges": True,
                "ai_tools": True,
                "bazaar_choice": True,
            },
        ]

        for plan_data in plans:
            code = plan_data.pop("code")
            plan, created = SubscriptionPlan.objects.update_or_create(
                code=code,
                defaults=plan_data,
            )

            action = "Created" if created else "Updated"
            self.stdout.write(
                self.style.SUCCESS(f"{action}: {plan.name}")
            )

        self.stdout.write(
            self.style.SUCCESS("Subscription plans are ready.")
        )