import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'apponco_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile
from django.utils import timezone
from datetime import timedelta

# Criar um usuário de teste
user, created = User.objects.get_or_create(
    username='teste',
    defaults={
        'email': 'teste@example.com',
        'first_name': 'Teste',
        'last_name': 'User'
    }
)

# Criar ou atualizar o profile
profile, _ = UserProfile.objects.get_or_create(
    user=user,
    defaults={
        'user_type': 'patient',
        'treatment_start_date': timezone.now().date() - timedelta(days=5),
        'treatment_duration_days': 30,
        'bio': 'Usuário de teste'
    }
)

print("✅ Usuário criado/atualizado com sucesso!")
print(f"Username: {user.username}")
print(f"Email: {user.email}")
print(f"Dia atual do tratamento: {profile.current_day}")
print(f"Progresso: {profile.treatment_progress_percent:.1f}%")
print(f"Total de dias: {profile.treatment_duration_days}")
print("\n✅ Banco Neon está funcionando corretamente!")
