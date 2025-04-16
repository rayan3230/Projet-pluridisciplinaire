from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model, exposing fields needed by the frontend."""
    # Replace nested serializer with a method field returning IDs
    assigned_base_module_ids = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'scope_email', 'full_name', 'personnel_email', 'is_active', 'is_admin', 
            'is_teacher', 'is_staff', 'is_superuser', 'needs_password_change', 'last_login',
            'assigned_base_module_ids' # Use the new field
        )
        # `scope_email`, role flags, and `last_login` are typically read-only.
        read_only_fields = ('date_joined', 'assigned_base_module_ids')

    def get_assigned_base_module_ids(self, obj):
        # Efficiently get a list of assigned base module IDs
        if hasattr(obj, 'base_module_assignments'):
             return list(obj.base_module_assignments.values_list('base_module_id', flat=True))
        return [] # Return empty list if relation doesn't exist or no assignments

    def create(self, validated_data):
        # Use the custom manager's create_user method
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Handle password separately if included
        password = validated_data.pop('password', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        # Set password if provided
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance


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
        