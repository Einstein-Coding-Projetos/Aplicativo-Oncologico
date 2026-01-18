from rest_framework import serializers
from core.models import RelatoCaso

class RelatoCasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatoCaso
        fields = "__all__"
