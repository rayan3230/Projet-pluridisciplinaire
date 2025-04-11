from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login/', views.Login_User, name='login'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]