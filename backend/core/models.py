from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# 1. Configurações Globais
USER_TYPE_CHOICES = [
    ('patient', 'Paciente'),
    ('psychologist', 'Psicólogo'),
]

# 2. Perfil do Usuário (Sem as regras de data/horário)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='core_profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='patient')
    bio = models.TextField(blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    # Tratamento oncologico
    treatment_start_date = models.DateField(null=True, blank=True, help_text="Data de início")
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

# 3. Agendamentos (Aqui ficam as regras de data e status)
class Appointment(models.Model):
    # Deve bater com a migração:
    date = models.DateField()
    horario = models.TimeField()
    status = models.CharField(
        max_length=20, 
        choices=[('disponivel', 'Disponível'), ('agendado', 'Agendado'), ('concluida', 'Concluída')], 
        default='disponivel'
    )
    paciente = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='core_minhas_consultas' # Exatamente como na migração
    )
    psicologo = models.ForeignKey(
        User, on_delete=models.CASCADE, 
        related_name='core_agenda_profissional' # Exatamente como na migração
    )

    class Meta:
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'

    def __str__(self):
        return f"{self.date} {self.horario} - {self.psicologo.username if self.psicologo else 'Livre'}"

# 4. Relatos
class RelatoCaso(models.Model):
    titulo = models.CharField(max_length=255, blank=True, null=True)
    subtitulo = models.CharField(max_length=300, blank=True, null=True)
    texto = models.TextField()
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    fonte = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.titulo or "Relato Sem Título"