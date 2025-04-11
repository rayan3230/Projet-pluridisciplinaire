from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
# Register users viewset at the root of this app's URLs (e.g., /api/users/)
router.register(r'', views.UserViewSet, basename='user') 

urlpatterns = [
    # Include router URLs first (covers /api/users/ endpoint)
    path('', include(router.urls)),
    # Define login relative to the app's base (/api/users/auth/login/)
    path('auth/login/', views.Login_User, name='login'),
    # Define change-password relative to the app's base (/api/users/change-password/)
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]