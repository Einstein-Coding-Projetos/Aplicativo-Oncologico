from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_appointment_add_user_fk'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='activity_streak',
            field=models.IntegerField(default=0, help_text='Dias consecutivos de atividade'),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='today_activity_completed',
            field=models.BooleanField(default=False, help_text='Atividade do dia concluída'),
        ),
    ]
