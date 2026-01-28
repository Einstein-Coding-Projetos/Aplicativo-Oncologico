from rest_framework import serializers
from core.models import RelatoCaso, Appointment

class RelatoCasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatoCaso
        fields = "__all__"

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'title', 'date', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
