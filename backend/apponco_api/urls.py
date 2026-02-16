"""
URL configuration for apponco_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import agendar, concluir_consulta, horarios_ocupados, consultas_concluidas,limpar_historico


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/accounts/', include('accounts.urls')),
    path("api/", include("core.urls")),
    path('agendar', agendar, name='agendar'),
    path('concluir/<int:id_consulta>', concluir_consulta, name='concluir'),
    path ('concluidas', consultas_concluidas, name='concluidas'),
    path('horarios-ocupados/<str:nome_profissional>', horarios_ocupados, name='horarios_ocupados'),
    path('limpar-historico/', limpar_historico, name='limpar_historico'),]




