from django.urls import path
from .views import *

urlpatterns = [
    path("register/", register_user, name="register"),
    path("register/vendor/", register_vendor, name="register-vendor"),
    path("me/", current_user),
     path("profile/", profile),
     path("change-password/", change_password),
     path("delete-account/", delete_account),
]