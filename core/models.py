from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# Escolhas para o tipo de usuário
USER_TYPE_CHOICES = (
    ('patient', 'Paciente'),
    ('psychologist', 'Psicólogo'),
)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='core_profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='patient')
    bio = models.TextField(blank=True, null=True)
    
    # Tratamento oncologico
    treatment_start_date = models.DateField(null=True, blank=True)
    treatment_duration_days = models.IntegerField(null=True, blank=True)
    activity_streak = models.IntegerField(default=0)
    today_activity_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.user_type}"

    @property
    def current_day(self) -> int:
        if not self.treatment_start_date:
            return 0
        days_elapsed = (timezone.now().date() - self.treatment_start_date).days
        return max(1, min(days_elapsed + 1, self.treatment_duration_days or 0))

class Appointment(models.Model):
    STATUS_CHOICES = [
        ("disponivel", "Disponível"),
        ("agendado", "Agendado"),
        ("concluido", "Concluído"),
        ("cancelado", "Cancelado"),
        ("pendente", "Pendente"),
    ]

    psicologo = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agenda_psicologo', null=True)
    paciente = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='consultas_paciente', null=True, blank=True)
    
    date = models.DateField()
    horario = models.TimeField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="disponivel")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['psicologo', 'date', 'horario']
        ordering = ['date', 'horario']

    def __str__(self) -> str:
        return f"{self.date} {self.horario} - {self.psicologo.username if self.psicologo else 'Livre'}"

class RelatoCaso(models.Model):
    titulo = models.CharField(max_length=255, blank=True)
    texto = models.TextField()
    fonte = models.URLField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo or f"Relato {self.id}"