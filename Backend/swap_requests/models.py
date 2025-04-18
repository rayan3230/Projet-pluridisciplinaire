from django.db import models
from django.conf import settings

# Create your models here.

class SwapRequest(models.Model):
    requesting_teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_requests')
    receiving_teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_requests')
    requested_class = models.CharField(max_length=255)  # Class the requesting teacher wants
    offered_class = models.CharField(max_length=255)    # Class being offered in exchange
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Swap request from {self.requesting_teacher} to {self.receiving_teacher}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
