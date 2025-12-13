from rest_framework import serializers
from .models import RelatoCaso

class RelatoCasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatoCaso
        fields = "__all__"
