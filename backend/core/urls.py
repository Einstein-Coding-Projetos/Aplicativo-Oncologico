from django.urls import path
from .views import relato_aleatorio

urlpatterns = [
    path("relato-aleatorio/", relato_aleatorio),
]
