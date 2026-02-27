import re
from datetime import datetime

from django.db import migrations, models
from django.db.models import Q


TIME_PATTERNS = [
    '%H:%M',
    '%H:%M:%S',
]


def normalize_horario_values(apps, schema_editor):
    Appointment = apps.get_model('core', 'Appointment')

    normalized = 0
    coerced = 0

    for appointment in Appointment.objects.all().only('id', 'horario'):
        raw = (appointment.horario or '').strip()
        parsed = None

        for pattern in TIME_PATTERNS:
            try:
                parsed = datetime.strptime(raw, pattern).time()
                break
            except ValueError:
                continue

        if parsed is None:
            # Accept one-digit hour values such as 8:00
            match = re.fullmatch(r'(?P<h>\d{1,2}):(?P<m>\d{2})', raw)
            if match:
                hour = int(match.group('h'))
                minute = int(match.group('m'))
                if 0 <= hour <= 23 and 0 <= minute <= 59:
                    parsed = datetime.strptime(f"{hour:02d}:{minute:02d}", '%H:%M').time()

        if parsed is None:
            # Keep migration deterministic by coercing invalid historical values.
            parsed = datetime.strptime('00:00', '%H:%M').time()
            coerced += 1
        else:
            normalized += 1

        appointment.horario = parsed.strftime('%H:%M:%S')
        appointment.save(update_fields=['horario'])

    print(
        f"[core.0008] horario normalization finished: normalized={normalized}, coerced_invalid={coerced}"
    )


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_normalize_appointment_status_and_require_user'),
    ]

    operations = [
        migrations.RunPython(normalize_horario_values, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='appointment',
            name='horario',
            field=models.TimeField(),
        ),
        migrations.AddConstraint(
            model_name='userprofile',
            constraint=models.CheckConstraint(
                check=Q(treatment_duration_days__isnull=True) | Q(treatment_duration_days__gt=0),
                name='userprofile_treatment_duration_positive_or_null',
            ),
        ),
    ]
