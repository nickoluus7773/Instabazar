from django.urls import path
from .views import *

urlpatterns = [
    path("", reviews),
    path("profile/reviews/", my_reviews),
    path("reviews/<int:id>/", review_detail),
]