# Configuração Neon Database

## ✅ O que foi feito:

### Backend (Django)
1. **Atualizei `.env`** com a string de conexão do Neon (DATABASE_URL)
2. **Atualizei `settings.py`** para suportar:
   - `DATABASE_URL` (Neon) - prioridade
   - Variáveis individuais (fallback local)
3. **Adicionei `dj-database-url`** ao `requirements.txt`
4. **Criei modelo `DailyActivity`** para rastrear ações diárias
5. **Atualizei serializers** com novos campos

### Como usar:

#### 1. **Instalar dependências**
```bash
pip install -r requirements.txt
```

#### 2. **Executar migrações**
```bash
python manage.py migrate
```

#### 3. **Criar superuser (opcional)**
```bash
python manage.py createsuperuser
```

#### 4. **Ou use o script de setup**

**Windows (PowerShell):**
```powershell
.\setup_neon.ps1
```

**Linux/Mac (Bash):**
```bash
bash setup_neon.sh
```

### Alternativa: Setup rápido sem script
```powershell
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # opcional
python manage.py runserver
```

## 📊 Banco de dados

- **Provider:** Neon (PostgreSQL em nuvem)
- **Host:** `ep-divine-glitter-aiq1hnat-pooler.c-4.us-east-1.aws.neon.tech`
- **Database:** `neondb`
- **SSL:** ✅ Ativado (sslmode=require)

## 🔐 Variáveis de ambiente

O arquivo `.env` contém:
```
DATABASE_URL=postgresql://neondb_owner:npg_6Ae0qhbRSHkp@...
DJANGO_SECRET_KEY=change-me-please
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
```

**⚠️ Importante:** Não commit `.env` com credenciais reais. Use um `.env.example` para produção.

## ✨ Novos modelos

### DailyActivity
Rastreia ações diárias do usuário:
- `user` - FK para User
- `date` - Data da atividade
- `activity_type` - Tipo (journal, appointment, etc)
- `completed` - Boolean

### UserProfile (atualizado)
- `activity_streak` - Dias seguidos (property)
- `today_activity_completed` - Boolean (property)

## 🧪 Teste a conexão

```bash
python manage.py shell
>>> from django.db import connection
>>> connection.ensure_connection()
>>> print("✅ Conexão com Neon funcionando!")
```

## 📱 Frontend

Certifique-se de atualizar o IP do backend em `frontend/app/(tabs)/index.tsx`:
```typescript
// Mude isso:
const response = await fetch('http://ip:8000/api/user-profile/me/');
// Para seu IP real ou localhost:8000
```

---

**Dúvidas?** Consulte a documentação do Neon: https://neon.tech/docs
