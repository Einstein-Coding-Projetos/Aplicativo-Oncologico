from rest_framework import serializers
from core.models import RelatoCaso, Appointment, UserProfile


class NormalizedTimeField(serializers.TimeField):
    def to_internal_value(self, value):
        if isinstance(value, str):
            value = value.strip()
            if len(value) == 4 and value[1] == ':':
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
                    {'horario': 'Este horario ja esta ocupado para o profissional selecionado.'}
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
    profile_photo = serializers.ImageField(write_only=True, required=False, allow_null=True)
    profile_photo_url = serializers.SerializerMethodField(read_only=True)
    remove_profile_photo = serializers.BooleanField(write_only=True, required=False, default=False)

    def get_profile_photo_url(self, obj):
        if not obj.profile_photo:
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.profile_photo.url)
        return obj.profile_photo.url

    def update(self, instance, validated_data):
        remove_profile_photo = validated_data.pop('remove_profile_photo', False)
        has_new_photo = 'profile_photo' in validated_data
        new_photo = validated_data.pop('profile_photo', None) if has_new_photo else None

        if remove_profile_photo and instance.profile_photo:
            instance.profile_photo.delete(save=False)
            instance.profile_photo = None

        if has_new_photo:
            if instance.profile_photo:
                instance.profile_photo.delete(save=False)
            instance.profile_photo = new_photo

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'user_type', 'bio', 'profile_photo', 'profile_photo_url',
            'remove_profile_photo', 'treatment_start_date', 'treatment_duration_days',
            'current_day', 'treatment_progress_percent', 'activity_streak', 'today_activity_completed',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
