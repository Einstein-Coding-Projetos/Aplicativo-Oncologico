from rest_framework import serializers
from core.models import RelatoCaso, Appointment, UserProfile


class NormalizedTimeField(serializers.TimeField):
    def to_internal_value(self, value):
        if isinstance(value, str):
            value = value.strip()
            if len(value) == 4 and value[1] == ':':
                # Support legacy/input variants like 8:00 while persisting as proper time.
                value = f"0{value}"
        return super().to_internal_value(value)


class RelatoCasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatoCaso
        fields = "__all__"

class AppointmentSerializer(serializers.ModelSerializer):
    horario = NormalizedTimeField(format='%H:%M', input_formats=['%H:%M', '%H:%M:%S'])

    def validate(self, attrs):
        profissional = attrs.get('profissional')
        date = attrs.get('date')
        horario = attrs.get('horario')

        if profissional and date and horario:
            queryset = Appointment.objects.filter(
                profissional=profissional,
                date=date,
                horario=horario,
            )
            instance = getattr(self, 'instance', None)
            if instance is not None:
                queryset = queryset.exclude(pk=instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    {'horario': 'Este hor\u00e1rio j\u00e1 est\u00e1 ocupado para o profissional selecionado.'}
                )

        return attrs

    class Meta:
        model = Appointment
        fields = ['id', 'profissional', 'date', 'horario', 'status', 'created_at']
        read_only_fields = ['id', 'created_at', 'status']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    current_day = serializers.IntegerField(read_only=True)
    treatment_progress_percent = serializers.FloatField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'user_type', 'bio',
            'treatment_start_date', 'treatment_duration_days',
            'current_day', 'treatment_progress_percent',
            'activity_streak', 'today_activity_completed',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
