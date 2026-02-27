#!/bin/bash

# Script de configuração do banco de dados Neon

echo "🔧 Configurando banco de dados Neon..."

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Executar migrações
echo "🗄️  Executando migrações..."
python manage.py migrate

# Criar superuser (opcional)
echo "👤 Deseja criar um superuser? (s/n)"
read -r create_superuser

if [ "$create_superuser" = "s" ]; then
    python manage.py createsuperuser
fi

echo "✅ Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. python manage.py runserver"
echo "2. Acesse http://localhost:8000/admin"
