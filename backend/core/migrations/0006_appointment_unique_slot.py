from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_userprofile_activity_streak_today_activity_completed'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='appointment',
            constraint=models.UniqueConstraint(
                fields=('profissional', 'date', 'horario'),
                name='uniq_appointment_profissional_date_horario',
            ),
        ),
    ]
