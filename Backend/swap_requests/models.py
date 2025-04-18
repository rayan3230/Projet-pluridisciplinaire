from django.db import models
from django.conf import settings

# Create your models here.

class SwapRequest(models.Model):
    requesting_teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_requests')
    requesting_teacher_id = models.IntegerField(null=True, blank=True)  # New field
    receiving_teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_requests')
    requested_class = models.CharField(max_length=255)  # Class the requesting teacher wants
    offered_class = models.CharField(max_length=255)    # Class being offered in exchange
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        if not self.requesting_teacher_id and self.requesting_teacher:
            self.requesting_teacher_id = self.requesting_teacher.id
        super().save(*args, **kwargs)
