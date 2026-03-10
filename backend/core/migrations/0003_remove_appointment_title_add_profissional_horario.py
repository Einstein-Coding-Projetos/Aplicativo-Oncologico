from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_appointment_rename_texto_relatocaso_conteudo_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='appointment',
            name='title',
        ),
        migrations.AddField(
            model_name='appointment',
            name='profissional',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='appointment',
            name='horario',
            field=models.CharField(default='', max_length=10),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='appointment',
            name='date',
            field=models.DateField(),
        ),
    ]
