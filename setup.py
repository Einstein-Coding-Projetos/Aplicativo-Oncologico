#!/usr/bin/env python
"""
Script de setup para novo desenvolvedor ou deploy
Uso: python setup.py
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Executa um comando e reporta o resultado"""
    print(f"\n{'='*60}")
    print(f"▶ {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, check=True)
        print(f"✅ {description} - OK")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FALHOU")
        print(f"Error: {e}")
        return False

def setup_backend():
    """Setup do backend Django"""
    print("\n" + "="*60)
    print("🚀 SETUP BACKEND DJANGO")
    print("="*60)
    
    os.chdir('backend')
    
    # 1. Instalar dependências
    if not run_command(
        'pip install -r requirements.txt',
        'Instalando dependências do backend'
    ):
        return False
    
    # 2. Criar .env se não existir
    if not Path('.env').exists():
        print("\n📝 Criando arquivo .env...")
        if Path('.env.example').exists():
            os.system('copy .env.example .env')
            print("✅ Arquivo .env criado. Edite com suas credenciais!")
        else:
            print("❌ .env.example não encontrado")
            return False
    
    # 3. Executar migrações
    if not run_command(
        'python manage.py migrate',
        'Aplicando migrações ao banco'
    ):
        return False
    
    # 4. Criar superusuário
    print("\n👤 Criando superusuário...")
    run_command(
        'python manage.py createsuperuser',
        'Criação de superusuário'
    )
    
    os.chdir('..')
    return True

def setup_frontend():
    """Setup do frontend Expo"""
    print("\n" + "="*60)
    print("🚀 SETUP FRONTEND EXPO")
    print("="*60)
    
    os.chdir('frontend')
    
    # 1. Instalar dependências
    if not run_command(
        'npm install',
        'Instalando dependências do frontend'
    ):
        return False
    
    # 2. Criar .env.local se não existir
    if not Path('.env.local').exists():
        print("\n📝 Criando arquivo .env.local...")
        if Path('.env.example').exists():
            with open('.env.example', 'r') as f:
                example = f.read()
            with open('.env.local', 'w') as f:
                f.write(example)
            print("✅ Arquivo .env.local criado. Edite com seu IP!")
        else:
            print("❌ .env.example não encontrado")
            return False
    
    os.chdir('..')
    return True

def main():
    """Executa o setup completo"""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "      SETUP GRADATIM APP - DESENVOLVIMENTO".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")
    
    # Verificar se está no diretório correto
    if not Path('backend').is_dir() or not Path('frontend').is_dir():
        print("\n❌ Execute este script no diretório raiz do projeto!")
        sys.exit(1)
    
    # Setup Backend
    if not setup_backend():
        print("\n❌ Setup do backend falhou!")
        sys.exit(1)
    
    # Setup Frontend
    if not setup_frontend():
        print("\n❌ Setup do frontend falhou!")
        sys.exit(1)
    
    # Resultado final
    print("\n" + "="*60)
    print("✅ SETUP CONCLUÍDO COM SUCESSO!")
    print("="*60)
    
    print("\n📋 Próximos passos:")
    print("  1. Edite backend/.env com suas credenciais")
    print("  2. Edite frontend/.env.local com seu IP")
    print("  3. Execute: python manage.py runserver (backend)")
    print("  4. Execute: npx expo start (frontend)")
    print("\n🎉 Boa sorte no desenvolvimento!")

if __name__ == '__main__':
    main()
