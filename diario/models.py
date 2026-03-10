
# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class Diario(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    data = models.DateField()
    humor = models.IntegerField()
    texto = models.TextField()

    class Meta:
        unique_together = ('user', 'data')

    def __str__(self):
        return f"{self.user.username} - {self.data}"