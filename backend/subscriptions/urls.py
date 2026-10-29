from django.urls import path

from subscriptions.views import (
    SubscriptionPlansView,
    CurrentSubscriptionView,
    SubscriptionHistoryView,
    SubscribeView,
     CreatePaymentOrderView,
    VerifyPaymentView,
    CancelSubscriptionView,
)

urlpatterns = [
    path("plans/", SubscriptionPlansView.as_view(), name="subscription-plans"),
    path("current/", CurrentSubscriptionView.as_view(), name="subscription-current"),
    path("history/", SubscriptionHistoryView.as_view(), name="subscription-history"),
    path("subscribe/", SubscribeView.as_view(), name="subscription-create"),
    path("cancel/", CancelSubscriptionView.as_view(), name="subscription-cancel"),
    path(
    "payment/create-order/",
    CreatePaymentOrderView.as_view(),
    name="subscription-payment-create-order",
),
path(
    "payment/verify/",
    VerifyPaymentView.as_view(),
    name="subscription-payment-verify",
),
]