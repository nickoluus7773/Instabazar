from django.urls import path
from .views import *

urlpatterns = [
    path("register/", register_user, name="register"),
    path("me/", current_user),
]