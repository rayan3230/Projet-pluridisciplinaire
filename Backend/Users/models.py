from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """Manager for the custom User model, using scope_email as the identifier."""
    def create_user(self, scope_email, password=None, **extra_fields):
        if not scope_email:
            raise ValueError(_('The Scope Email must be set'))
        scope_email = self.normalize_email(scope_email)
        user = self.model(scope_email=scope_email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, scope_email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True) # Superusers are implicitly admins and active
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(scope_email, password, **extra_fields)

class User(AbstractUser):
    """Custom User model for the Scope application."""
    username = None # Use scope_email instead
    first_name = None
    last_name = None

    scope_email = models.EmailField(_('scope email address'), max_length=100, unique=True)
    full_name = models.CharField(_('full name'), max_length=150)
    personnel_email = models.EmailField(_('personnel email address'), max_length=100, blank=True, null=True)
    
    is_admin = models.BooleanField(default=False) # General admin flag (can be staff without being teacher)
    is_teacher = models.BooleanField(default=False)
    needs_password_change = models.BooleanField(default=True) # Flag for initial login

    objects = CustomUserManager()

    USERNAME_FIELD = 'scope_email'
    REQUIRED_FIELDS = ['full_name'] # Required for createsuperuser

    # Use distinct related_names to avoid clashes with default auth.User model
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('groups'),
        blank=True,
        help_text=
            _('The groups this user belongs to. A user will get all permissions '
              'granted to each of their groups.'),
        related_name="custom_user_groups",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name="custom_user_permissions",
        related_query_name="custom_user",
    )

    def __str__(self):
        return self.scope_email

    # Add method to regenerate API key if needed (e.g., on password change? Optional)
    # def regenerate_api_key(self):
    #     self.api_key = uuid.uuid4()
    #     self.save(update_fields=['api_key'])

    
