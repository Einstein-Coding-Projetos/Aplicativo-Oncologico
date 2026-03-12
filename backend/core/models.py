from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Q


class Appointment(models.Model):
    STATUS_SCHEDULED = "agendado"
    STATUS_PENDING = "pendente"
    STATUS_COMPLETED = "concluido"
    STATUS_CANCELLED = "cancelado"

    STATUS_CHOICES = [
        (STATUS_SCHEDULED, "Agendado"),
        (STATUS_PENDING, "Pendente"),
        (STATUS_COMPLETED, "Concluido"),
        (STATUS_CANCELLED, "Cancelado"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    profissional = models.CharField(max_length=200)
    date = models.DateField()
    horario = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['profissional', 'date', 'horario'],
                name='uniq_appointment_profissional_date_horario',
            ),
        ]

    def __str__(self) -> str:
        return f"{self.profissional} @ {self.date} {self.horario} ({self.status})"

    @property
    def is_past(self) -> bool:
        """Returns True if the appointment date is in the past compared to today."""
        return self.date < timezone.now().date()

    def mark_completed(self) -> None:
        """Mark the appointment as completed and save."""
        self.status = self.STATUS_COMPLETED
        self.save()


class UserProfile(models.Model):
    USER_TYPE_CHOICES = (
        ('patient', 'Paciente'),
        ('psychologist', 'Psicologo'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='patient')
    bio = models.TextField(blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    # Tratamento oncologico
    treatment_start_date = models.DateField(null=True, blank=True, help_text="Data de inicio do tratamento")
    treatment_duration_days = models.IntegerField(null=True, blank=True, help_text="Duracao total do tratamento em dias")
    activity_streak = models.IntegerField(default=0, help_text="Dias consecutivos de atividade")
    today_activity_completed = models.BooleanField(default=False, help_text="Atividade do dia concluida")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(treatment_duration_days__isnull=True) | Q(treatment_duration_days__gt=0),
                name='userprofile_treatment_duration_positive_or_null',
            ),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.user_type}"

    @property
    def current_day(self) -> int:
        """Retorna o dia atual do tratamento (comecando em 1)."""
        if not self.treatment_start_date:
            return 0
        days_elapsed = (timezone.now().date() - self.treatment_start_date).days
        return max(1, min(days_elapsed + 1, self.treatment_duration_days or 0))

    @property
    def treatment_progress_percent(self) -> float:
        """Retorna o percentual de progresso do tratamento (0-100)."""
        if not self.treatment_duration_days or self.treatment_duration_days == 0:
            return 0
        return (self.current_day / self.treatment_duration_days) * 100

class RelatoCaso(models.Model):
    titulo = models.CharField(max_length=255, blank=True, null=True)
    subtitulo = models.CharField(max_length=300)
    texto = models.TextField()
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    exibido_em = models.DateField(null=True, blank=True)
    fonte = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.titulo
