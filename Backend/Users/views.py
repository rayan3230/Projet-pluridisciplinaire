from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, ChangePasswordSerializer
from rest_framework.views import APIView
from rest_framework import serializers as rest_serializers # Alias to avoid naming conflict
import random
import string
from django.core.mail import send_mail
from django.conf import settings

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Add permission classes if needed, e.g., IsAdminUser
    # permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        """Optionally filter users, e.g., by is_teacher."""
        queryset = User.objects.all()
        is_teacher_param = self.request.query_params.get('is_teacher')

        if is_teacher_param is not None:
            # More robust check for truthiness
            if isinstance(is_teacher_param, bool):
                is_teacher = is_teacher_param
            else: # Assume string otherwise
                is_teacher = is_teacher_param.lower() in ['true', '1']
                
            queryset = queryset.filter(is_teacher=is_teacher)
            
        return queryset.order_by('full_name') # Order teachers by name

    def create(self, request, *args, **kwargs):
        # Extract data from request
        full_name = request.data.get('full_name')
        personnel_email = request.data.get('personnel_email')
        # username = request.data.get('username') # Get username if needed
        is_teacher_request = request.data.get('is_teacher', False) # Check if frontend sends this flag
        is_admin_request = request.data.get('is_admin', False) # Allow creating admins too?

        if not full_name or not personnel_email:
            return Response({'detail': 'Full name and personnel email are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- Generate Scope Email ---
        # Simple generation: replace spaces, convert to lowercase. Add uniqueness check/handling.
        base_email_part = full_name.lower().replace(' ', '')
        scope_email = f"{base_email_part}@scope.com"
        # TODO: Add logic to ensure scope_email uniqueness (e.g., append number if exists)
        counter = 1
        while User.objects.filter(scope_email=scope_email).exists():
            scope_email = f"{base_email_part}{counter}@scope.com"
            counter += 1

        # --- Generate Temporary Password ---
        password_length = 10
        characters = string.ascii_letters + string.digits
        temporary_password = ''.join(random.choice(characters) for i in range(password_length))

        try:
            # --- Create User ---
            user = User.objects.create_user(
                scope_email=scope_email,
                password=temporary_password,
                full_name=full_name,
                personnel_email=personnel_email,
                is_teacher=bool(is_teacher_request),
                is_admin=bool(is_admin_request),
                is_staff=bool(is_admin_request), # Admins should probably be staff
                needs_password_change=True, # Force change on first login
                is_active=True # Activate account immediately
                # username=username # Pass username if using it
            )

            # --- Send Email --- 
            subject = 'Your Scope Account Credentials'
            message = (
                f'Hello {user.full_name},\n\n'
                f'An account has been created for you on Scope Scheduler.\n\n'
                f'Your Scope Email: {user.scope_email}\n'
                f'Your temporary password: {temporary_password}\n\n'
                f'Please log in and change your password immediately.\n\n'
                f'Thank you,\nThe Scope Admin Team'
            )
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.personnel_email]

            try:
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
                print(f"Credentials email sent successfully to {user.personnel_email}")
            except Exception as mail_error:
                print(f"ERROR sending credentials email to {user.personnel_email}: {mail_error}")
                # Decide how to handle email failure - maybe log it, but don't fail the user creation?
                # Optionally: Could delete the user here if email is critical, or flag for manual intervention.

            # --- Return Response --- 
            serializer = self.get_serializer(user)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            print(f"User Creation Error: {e}") # Log the specific error
            # Check for specific errors e.g., IntegrityError for duplicate personnel_email if it were unique
            return Response({'detail': f'An error occurred during user creation: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def Login_User(request):
    scope_email = request.data.get('scope_email')
    password = request.data.get('password')

    if not scope_email or not password:
        return Response({
            'message': 'Scope email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = authenticate(request, username=scope_email, password=password)
        if user is not None:
            from django.utils import timezone
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            serializer = UserSerializer(user) 
            return Response({
                'message': 'Login successful',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'detail': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print(f"Login Error: {e}") 
        return Response({
            'detail': 'An unexpected error occurred during login.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Serializer for Change Password endpoint
class ChangePasswordSerializer(rest_serializers.Serializer):
    scope_email = rest_serializers.EmailField(required=True)
    current_password = rest_serializers.CharField(required=True)
    new_password = rest_serializers.CharField(required=True)

    def validate_new_password(self, value):
        if len(value) < 8:
             raise rest_serializers.ValidationError("Password must be at least 8 characters long.")
        return value

# View for Changing Password
class ChangePasswordView(APIView):
    # Explicitly define allowed method, although POST should be default via post()
    http_method_names = ['post', 'head', 'options'] 

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            scope_email = serializer.validated_data.get('scope_email')
            current_password = serializer.validated_data.get('current_password')
            new_password = serializer.validated_data.get('new_password')

            try:
                user = User.objects.get(scope_email=scope_email)
            except User.DoesNotExist:
                 return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            if not user.check_password(current_password):
                return Response({"detail": "Current password is not correct."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.needs_password_change = False
            user.save()
            
            return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)