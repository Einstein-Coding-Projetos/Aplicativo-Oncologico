from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


LEGACY_COMPLETED = 'concluÃ­do'
VALID_STATUSES = {'agendado', 'pendente', 'concluido', 'cancelado'}


def normalize_appointments(apps, schema_editor):
    Appointment = apps.get_model('core', 'Appointment')

    # Safety note:
    # This migration enforces Appointment.user as non-null. Any historical orphan
    # rows (user is null) cannot satisfy the new constraint and are removed.
    # Before running migrations in production, take a backup:
    #   pg_dump --data-only --table=core_appointment <database_url> > backup_core_appointment.sql
    orphan_count = Appointment.objects.filter(user__isnull=True).count()
    if orphan_count:
        print(f"[core.0007] deleting orphan appointments before non-null FK migration: {orphan_count}")
    Appointment.objects.filter(user__isnull=True).delete()

    # Normalize legacy/invalid statuses to keep values consistent.
    for appointment in Appointment.objects.all().only('id', 'status'):
        status = appointment.status
        if status == LEGACY_COMPLETED:
            appointment.status = 'concluido'
            appointment.save(update_fields=['status'])
            continue
        if status not in VALID_STATUSES:
            appointment.status = 'pendente'
            appointment.save(update_fields=['status'])


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_appointment_unique_slot'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(normalize_appointments, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='appointment',
            name='status',
            field=models.CharField(
                choices=[
                    ('agendado', 'Agendado'),
                    ('pendente', 'Pendente'),
                    ('concluido', 'Concluido'),
                    ('cancelado', 'Cancelado'),
                ],
                default='agendado',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='appointment',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='appointments',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
