from django.contrib import admin
from .models import RelatoCaso, Appointment # Adicione o Appointment aqui

admin.site.register(RelatoCaso)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'psicologo', 'paciente', 'date', 'horario', 'status')
    list_filter = ('status', 'date')