from rest_framework import serializers
from core.models import RelatoCaso, Appointment, UserProfile

class RelatoCasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatoCaso
        fields = "__all__"

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'title', 'date', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    current_day = serializers.IntegerField(read_only=True)
    treatment_progress_percent = serializers.FloatField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'user_type', 'bio', 'treatment_start_date', 
                  'treatment_duration_days', 'current_day', 'treatment_progress_percent', 'created_at']
        read_only_fields = ['id', 'created_at']
