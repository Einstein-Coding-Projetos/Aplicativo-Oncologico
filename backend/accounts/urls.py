from django.urls import path
from .views import ForgotPasswordView, MeView, RegisterView, ResetPasswordView, PsicologoAgendaView

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('register/', RegisterView.as_view(), name='register'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('psicologo/agenda/', PsicologoAgendaView.as_view(), name='psicologo-agenda'),
]
