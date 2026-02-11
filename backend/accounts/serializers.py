from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    current_day = serializers.IntegerField(read_only=True)
    treatment_progress_percent = serializers.FloatField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'user_type',
            'bio',
            'treatment_start_date',
            'treatment_duration_days',
            'current_day',
            'treatment_progress_percent'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

    def get_profile(self, obj):
        """Retorna dados do profile do usuário"""
        try:
            profile = obj.profile
            return UserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            return None
