from django.contrib.auth.models import User
from django.db import transaction
from django.utils.text import slugify
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import *

from  users.models import UserProfile

from vendor.models import Vendor

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        "username": request.user.username
    })

@api_view(["POST"])
def register_user(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {"message": "User registered successfully"},
        status=status.HTTP_201_CREATED
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    profile = UserProfile.objects.get(user=request.user)

    serializer = ProfileSerializer(profile)

    return Response(serializer.data)
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile(request):
    profile = UserProfile.objects.get(user=request.user)

    if request.method == "GET":
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    serializer = ProfileSerializer(
        profile,
        data=request.data,
        partial=True,
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        user = request.user

        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"error": "Current password is incorrect."},
                status=400,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"message": "Password changed successfully."}
        )

    return Response(serializer.errors, status=400)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user

    user.delete()

    return Response(
        {"message": "Account deleted successfully."},
        status=200,
    )

@api_view(["POST"])
def register_vendor(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    business_name = request.data.get("business_name")
    instagram_handle = request.data.get("instagram_handle", "")
    location = request.data.get("location", "")
    bio = request.data.get("bio", "")
    logo_url = request.data.get("logo_url", "")
    follower_count = request.data.get("follower_count", 0)
    subscription_plan = request.data.get("subscription_plan", "free")

    if not username or not email or not password or not business_name:
        return Response(
            {"error": "Username, email, password, and business name are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    base_slug = slugify(business_name) or "vendor"
    store_slug = base_slug
    suffix = 2
    while Vendor.objects.filter(store_slug=store_slug).exists():
        store_slug = f"{base_slug}-{suffix}"
        suffix += 1

    with transaction.atomic():
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        Vendor.objects.create(
            user=user,
            business_name=business_name,
            instagram_handle=instagram_handle or None,
            location=location or None,
            bio=bio or None,
            logo_url=logo_url or None,
            follower_count=int(follower_count or 0),
            subscription_plan=subscription_plan if subscription_plan in ["free", "paid"] else "free",
            store_slug=store_slug,
        )

    return Response(
        {"message": "Vendor registration submitted successfully. Your account is pending verification."},
        status=status.HTTP_201_CREATED,
    )