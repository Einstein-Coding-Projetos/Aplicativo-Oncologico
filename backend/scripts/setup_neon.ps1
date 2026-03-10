# Script de configuração do banco de dados Neon para Windows

Write-Host "🔧 Configurando banco de dados Neon..." -ForegroundColor Cyan

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
pip install -r requirements.txt

# Executar migrações
Write-Host "🗄️  Executando migrações..." -ForegroundColor Yellow
python manage.py migrate

# Criar superuser (opcional)
Write-Host "👤 Deseja criar um superuser? (s/n)" -ForegroundColor Green
$response = Read-Host

if ($response -eq "s") {
    python manage.py createsuperuser
}

Write-Host "✅ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. python manage.py runserver"
Write-Host "2. Acesse http://localhost:8000/admin"
