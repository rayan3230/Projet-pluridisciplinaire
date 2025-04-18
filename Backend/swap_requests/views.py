from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SwapRequest
from .serializers import SwapRequestSerializer

# Create your views here.

class SwapRequestViewSet(viewsets.ModelViewSet):
    queryset = SwapRequest.objects.all()
    serializer_class = SwapRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all swap requests
        for the currently authenticated user.
        """
        user = self.request.user
        return SwapRequest.objects.filter(receiving_teacher=user)

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """
        Custom endpoint to get all requests for the current user
        """
        user = request.user
        received_data = user.get_received_swap_requests()
        
        # Get the full objects for serialization
        requests = received_data['requests']
        serializer = self.get_serializer(requests, many=True)
        
        return Response({
            'requests': serializer.data,
            'requests_with_ids': received_data['requests_with_ids']
        })

    def perform_create(self, serializer):
        """Automatically set the requesting teacher to the current user"""
        serializer.save(requesting_teacher=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Custom delete to ensure users can only delete their own requests"""
        instance = self.get_object()
        if instance.receiving_teacher != request.user:
            return Response(
                {"detail": "You can only delete your own requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
