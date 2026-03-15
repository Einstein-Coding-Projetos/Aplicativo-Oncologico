from rest_framework import serializers
from django.contrib.auth.models import User
from core.serializers import UserProfileSerializer

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'is_staff']

    def get_profile(self, obj):
        # Tenta pegar o perfil pelo nome que definimos no conflito
        perfil = getattr(obj, 'core_profile', None)
        if perfil:
            return UserProfileSerializer(perfil).data
        return None