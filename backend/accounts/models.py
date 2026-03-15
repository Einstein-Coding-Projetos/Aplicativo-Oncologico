from django.db import models
from django.contrib.auth.models import User

# Se você tiver um modelo de Perfil, adicione:
class Profile(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='accounts_profile' # Adicione isso aqui
    )
    is_psicologo = models.BooleanField(default=False)

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('disponivel', 'Disponível'),
        ('agendado', 'Agendado'),
        ('concluida', 'Concluída'),
    ]

    psicologo = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agenda_profissional')
    paciente = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='minhas_consultas')
    date = models.DateField()
    horario = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponivel')

    class Meta:
        # Remova qualquer CheckConstraint que você tenha tentado colocar manualmente aqui por enquanto
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'

    def __str__(self):
        return f"{self.date} {self.horario} - {self.psicologo.username}"