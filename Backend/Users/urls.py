from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='user') # Keep at root

urlpatterns = [
    # Define specific paths first
    path('auth/login/', views.Login_User, name='login'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    # Include router URLs LAST
    path('', include(router.urls)),
]