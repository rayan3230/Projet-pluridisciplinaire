from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer

# --- Django Admin Configuration ---
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    # Use the custom fields in the admin list display, search, and filter
    list_display = ('scope_email', 'full_name', 'is_admin', 'is_teacher', 'is_staff', 'is_active', 'needs_password_change')
    list_filter = ('is_admin', 'is_teacher', 'is_staff', 'is_active', 'needs_password_change')
    search_fields = ('scope_email', 'full_name', 'personnel_email')
    ordering = ('scope_email',)

    # Define fieldsets for the admin add/change forms
    # Customize as needed to match your User model fields
    fieldsets = (
        (None, {'fields': ('scope_email', 'password')}), # Password field is automatically handled by BaseUserAdmin
        ('Personal info', {'fields': ('full_name', 'personnel_email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_admin', 'is_teacher', 'needs_password_change', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    # Add fields for the 'add user' form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('scope_email', 'full_name', 'personnel_email', 'password', 'password2', 'is_admin', 'is_teacher', 'is_staff', 'is_active') # Add other fields as needed
        }),
    )
