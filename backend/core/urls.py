from django.urls import path
from .views import relato_do_dia

urlpatterns = [
    path("relato-do-dia/", relato_do_dia),
]
