from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model, exposing fields needed by the frontend."""
    class Meta:
        model = User
        fields = [
            'id', 
            'scope_email', 
            'full_name', 
            'personnel_email', 
            'is_active', 
            'is_admin', 
            'is_teacher', 
            'is_staff',
            'is_superuser',
            'needs_password_change', 
            'last_login',
        ]
        # `scope_email`, role flags, and `last_login` are typically read-only.
        read_only_fields = [
            'id', 
            'scope_email', 
            'last_login', 
            'is_staff', 
            'is_superuser', 
            'is_admin', 
            'is_teacher',
            'is_active'
        ]


# Serializer for Change Password endpoint
class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for handling user password changes."""
    scope_email = serializers.EmailField(required=True)
    current_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate_new_password(self, value):
        # Example validation, add more complex rules if needed
        if len(value) < 8:
             raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value 
        