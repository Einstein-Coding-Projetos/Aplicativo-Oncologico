from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Appointment(models.Model):
	STATUS_SCHEDULED = "agendado"
	STATUS_COMPLETED = "concluído"
	STATUS_CANCELLED = "pendente"

	STATUS_CHOICES = [
		(STATUS_SCHEDULED, "Agendado"),
		(STATUS_COMPLETED, "Concluído"),
		(STATUS_CANCELLED, "Pendente"),
	]

	title = models.CharField(max_length=200)
	date = models.DateTimeField()
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SCHEDULED)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return f"{self.title} @ {self.date.isoformat()} ({self.status})"

	@property
	def is_past(self) -> bool:
		"""Returns True if the appointment date is in the past compared to now."""
		return self.date < timezone.now()

	def mark_completed(self) -> None:
		"""Mark the appointment as completed and save."""
		self.status = self.STATUS_COMPLETED
		self.save()


class UserProfile(models.Model):
    USER_TYPE_CHOICES = (
        ('patient', 'Paciente'),
        ('psychologist', 'Psicólogo'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='patient')
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.user_type}"

class RelatoCaso(models.Model):
    titulo = models.CharField(max_length=255, blank=True)
    texto = models.TextField()
    fonte = models.URLField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo or f"Relato {self.id}"
