from django.core.management.base import BaseCommand

from subscriptions.services import expire_old_subscriptions


class Command(BaseCommand):
    help = "Expire paid subscriptions that have reached their expiry date."

    def handle(self, *args, **options):
        count = expire_old_subscriptions()
        self.stdout.write(
            self.style.SUCCESS(
                f"Expired {count} subscription(s)."
            )
        )