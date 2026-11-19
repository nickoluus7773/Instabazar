from django.urls import path
from . import views

urlpatterns = [
    path("", views.broadcast_list, name="broadcast-list"),
    path("products/", views.products, name="broadcast-products"),
    path("eligibility/", views.eligibility, name="broadcast-eligibility"),
    path("analytics/", views.analytics, name="broadcast-analytics"),
    path("feed/", views.feed, name="broadcast-feed"),
    path("notifications/", views.notifications, name="broadcast-notifications"),
    path("<int:pk>/", views.broadcast_detail, name="broadcast-detail"),
    path("<int:pk>/publish/", views.publish, name="broadcast-publish"),
    path("<int:pk>/archive/", views.archive, name="broadcast-archive"),
    path("<int:pk>/read/", views.mark_read, name="broadcast-read"),
    path("<int:pk>/click/", views.click, name="broadcast-click"),
]
