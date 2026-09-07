from django.urls import path
from .views import *

urlpatterns = [
    path("reviews/", reviews, name="reviews"),
    path("profile/reviews/", my_reviews, name="my-reviews"),
    path("reviews/<int:id>/", review_detail, name="review-detail"),
]