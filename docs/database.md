# 📊 Guia Completo: Visualizar Tabelas e Adicionar Novas

## 🔍 **PARTE 1: VISUALIZAR TABELAS NO NEON**

### Opção 1️⃣: Via Neon Console (Interface Gráfica)

**Passo a passo:**

1. Abra https://console.neon.tech
2. Faça login com suas credenciais
3. Selecione seu projeto **"Aplicativo-Oncologico"** ou similar
4. Na esquerda, expanda **Databases**
5. Clique em **neondb** (seu banco)
6. Expanda **public** (schema padrão)
7. Veja todas as tabelas:
   ``` 
   📑 Tables
   ├── auth_group
   ├── auth_user
   ├── core_appointment        ← Criada pelos seus models!
   ├── core_relatocaso         ← Criada pelos seus models!
   ├── core_userprofile        ← Criada pelos seus models!
   └── django_migrations
   ```

8. **Clique em uma tabela** para ver:
   - Colunas (fields)
   - Tipos de dados
   - Restrições (constraints)

### Opção 2️⃣: Via SQL Editor (SQL Puro)

1. No Neon Console, vá em **SQL Editor**
2. Cole este comando:
   ```sql
   -- Ver TODAS as tabelas
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema='public'
   ORDER BY table_name;
   ```
3. Execute (Ctrl + Enter)
4. Resultado mostrará todas as tabelas

### Opção 3️⃣: Ver Estrutura de Uma Tabela

```sql
-- Ver colunas de uma tabela específica
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name='core_userprofile'
ORDER BY ordinal_position;
```

**Resultado esperado:**
```
column_name          | data_type | is_nullable
--------------------|-----------|----------
id                   | bigint    | NO
user_id              | integer   | NO
user_type            | varchar   | NO
treatment_start_date | date      | YES
created_at           | timestamp | NO
```

---

## ➕ **PARTE 2: ADICIONAR NOVAS TABELAS**

### 🚀 **Passo a Passo Completo**

#### **PASSO 1: Criar o Model em Django**

Edite `backend/core/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User

# Seu novo modelo
class DiaryEntry(models.Model):
    """Tabela para entradas do diário do usuário"""
    
    # Campos
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diary_entries')
    date = models.DateField()
    mood = models.CharField(max_length=50)  # Sentimento (feliz, triste, etc)
    content = models.TextField()  # Conteúdo da entrada
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']  # Mais recente primeiro
        unique_together = ('user', 'date')  # Um diário por dia
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"
```

#### **PASSO 2: Criar Migração**

Execute no terminal:
```bash
cd backend
python manage.py makemigrations
```

**Saída esperada:**
```
Migrations for 'core':
  core\migrations\0003_diaryentry.py
    + Create model DiaryEntry
```

#### **PASSO 3: Verificar a Migração (Opcional)**

Abra o arquivo gerado: `backend/core/migrations/0003_diaryentry.py`

Você verá algo como:
```python
class Migration(migrations.Migration):
    dependencies = [
        ('core', '0002_appointment_rename_texto_relatocaso_conteudo_and_more'),
    ]
    operations = [
        migrations.CreateModel(
            name='DiaryEntry',
            fields=[
                ('id', models.BigAutoField(...)),
                ('user', models.ForeignKey(...)),
                ('date', models.DateField()),
                ('mood', models.CharField(...)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(...)),
                ('updated_at', models.DateTimeField(...)),
            ],
        ),
    ]
```

#### **PASSO 4: Aplicar Migração ao Neon**

```bash
python manage.py migrate
```

**Saída esperada:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, core, sessions
Running migrations:
  Applying core.0003_diaryentry... OK
```

#### **PASSO 5: Verificar no Neon**

```bash
python check_neon_tables.py
```

Você verá:
```
✅ core_diaryentry   ← NOVA TABELA!
```

Ou no Neon Console em **Tables**, expanda **public** e veja `core_diaryentry`.

---

## 📋 **EXEMPLO REAL: Adicionar Tabela de Medicamentos**

Vou criar um exemplo completo:

### **1. Editar models.py:**

```python
class Medication(models.Model):
    """Tabela de medicamentos do usuário"""
    
    FREQUENCY_CHOICES = [
        ('daily', 'Diariamente'),
        ('weekly', 'Semanalmente'),
        ('monthly', 'Mensalmente'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)  # Ex: "500mg"
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"
```

### **2. Executar:**

```bash
python manage.py makemigrations
python manage.py migrate
python check_neon_tables.py
```

### **3. Pronto!** 

Tabela `core_medication` criada no Neon! 🎉

---

## 🎯 **CHECKLIST PARA ADICIONAR NOVA TABELA**

```
1. ✅ Criar Model em backend/core/models.py
2. ✅ python manage.py makemigrations
3. ✅ Revisar arquivo de migração gerado
4. ✅ python manage.py migrate
5. ✅ Verificar no Neon console ou com check_neon_tables.py
6. ✅ Criar Serializer em backend/core/serializers.py (se necessário)
7. ✅ Criar View em backend/core/views.py (se necessário)
8. ✅ Adicionar rota em backend/core/urls.py (se necessário)
9. ✅ Testar com curl ou Postman
10. ✅ Commit: git add . && git commit -m "feat: adicionar tabela Medication"
```

---

## ⚠️ **ERROS COMUNS**

### ❌ "django_db.models import models not found"
```python
# ❌ ERRADO
from models import Model

# ✅ CORRETO
from django.db import models
```

### ❌ Esqueceu de adicionar app em INSTALLED_APPS
```python
# backend/apponco_api/settings.py
INSTALLED_APPS = [
    ...
    'core',  # ← Certifique-se que está aqui
    'accounts',
]
```

### ❌ Migração "não detecta" mudanças
```bash
# Tente
python manage.py makemigrations --empty core --name meu_fix

# Ou forçar rescan
python manage.py makemigrations --dry-run
```

---

## 🚀 **DICAS ÚTEIS**

### Ver histórico de migrações:
```bash
python manage.py showmigrations core
```

### Reverter última migração (CUIDADO!):
```bash
python manage.py migrate core 0002_appointment_rename_texto_relatocaso_conteudo_and_more
```

### Executar migração específica em outro banco:
```bash
python manage.py migrate --database=production
```

### Ver SQL gerado:
```bash
python manage.py sqlmigrate core 0003_diaryentry
```

---

## 📊 **FLUXO VISUAL**

```
┌─────────────────────┐
│   Editar models.py  │
│ (criar novo Model)  │
└──────────┬──────────┘
           │
           ↓
┌──────────────────────────────┐
│ python makemigrations        │
│ (gera arquivo de migração)   │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│ Revisar migration file       │
│ (verificar se está certo)    │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│ python migrate               │
│ (aplica ao Neon)             │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│ Verificar no Neon Console    │
│ (tabela criada!)             │
└──────────────────────────────┘
```

---

## 💡 **EXEMPLO PRÁTICO: Adicionar Tabela de Exercícios**

**1. Editar `core/models.py`:**
```python
class Exercise(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercises')
    name = models.CharField(max_length=200)
    duration_minutes = models.IntegerField()
    date = models.DateField()
    intensity = models.CharField(max_length=20, choices=[('light', 'Leve'), ('moderate', 'Moderada'), ('intense', 'Intensa')])
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.date})"
```

**2. Terminal:**
```bash
python manage.py makemigrations
python manage.py migrate
python check_neon_tables.py
```

**3. Resultado:**
```
✅ core_exercise   ← NOVA TABELA CRIADA!
```

**PRONTO!** Tabela pronta para usar no backend e frontend! 🎉

