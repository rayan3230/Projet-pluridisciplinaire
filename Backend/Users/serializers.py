from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Explicitly list fields needed by the frontend
        fields = [
            'id', 
            'scope_email', 
            'full_name', 
            'personnel_email', 
            'is_active', 
            'is_admin', 
            'is_teacher', 
            'needs_password_change', 
            'last_login',
        ]
        # Optionally make some fields read-only if they shouldn't be updated via this serializer
        read_only_fields = ['id', 'scope_email', 'last_login'] 


# Serializer for Change Password endpoint
class ChangePasswordSerializer(serializers.Serializer):
    # Add identifier field
    scope_email = serializers.EmailField(required=True)
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        if len(value) < 8:
             raise serializers.ValidationError("Password must be at least 8 characters long.")
        # Add more validation if necessary
        return value 
        