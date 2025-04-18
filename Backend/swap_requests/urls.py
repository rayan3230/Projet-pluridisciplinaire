from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SwapRequestViewSet

# Available Endpoints:
# GET    /api/swap-requests/                - List all swap requests for the current user
# POST   /api/swap-requests/                - Create a new swap request
# GET    /api/swap-requests/{id}/          - Get details of a specific swap request
# PUT    /api/swap-requests/{id}/          - Update a specific swap request
# PATCH  /api/swap-requests/{id}/          - Partially update a specific swap request
# DELETE /api/swap-requests/{id}/          - Delete a specific swap request
# GET    /api/swap-requests/my-requests/   - Get all requests received by the current user

router = DefaultRouter()
router.register(r'swap-requests', SwapRequestViewSet, basename='swap-request')

urlpatterns = [
    path('api/', include(router.urls)),
]

# Example API Responses:
"""
GET /api/swap-requests/my-requests/
Response:
{
    "requests": [
        {
            "id": 1,
            "requesting_teacher": 2,
            "requesting_teacher_name": "Dr. Smith",
            "requesting_teacher_id": 2,
            "receiving_teacher": 1,
            "receiving_teacher_name": "Prof. Johnson",
            "requested_class": "Monday 10:00 - 11:30 | Database Systems",
            "offered_class": "Wednesday 14:00 - 15:30 | Web Development",
            "accepted": false,
            "created_at": "2024-03-27T10:00:00Z"
        },
        ...
    ],
    "requests_with_ids": [
        {
            "id": 1,
            "requested_class": "Monday 10:00 - 11:30 | Database Systems",
            "offered_class": "Wednesday 14:00 - 15:30 | Web Development",
            "accepted": false,
            "created_at": "2024-03-27T10:00:00Z",
            "requesting_teacher_id": 2
        },
        ...
    ]
}
""" 