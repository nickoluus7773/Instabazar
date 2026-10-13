from django.urls import path

from subscriptions.views import (
    SubscriptionPlansView,
    CurrentSubscriptionView,
    SubscriptionHistoryView,
    SubscribeView,
)

urlpatterns = [
    path("plans/", SubscriptionPlansView.as_view(), name="subscription-plans"),
    path("current/", CurrentSubscriptionView.as_view(), name="subscription-current"),
    path("history/", SubscriptionHistoryView.as_view(), name="subscription-history"),
    path("subscribe/", SubscribeView.as_view(), name="subscription-create"),
]