from rest_framework import serializers
from .models import SwapRequest
from users.serializers import UserSerializer

class SwapRequestSerializer(serializers.ModelSerializer):
    requesting_teacher_name = serializers.CharField(source='requesting_teacher.full_name', read_only=True)
    receiving_teacher_name = serializers.CharField(source='receiving_teacher.full_name', read_only=True)
    
    class Meta:
        model = SwapRequest
        fields = [
            'id',
            'requesting_teacher',
            'requesting_teacher_name',
            'requesting_teacher_id',
            'receiving_teacher',
            'receiving_teacher_name',
            'requested_class',
            'offered_class',
            'accepted',
            'created_at'
        ]
        read_only_fields = ['requesting_teacher_name', 'receiving_teacher_name'] 