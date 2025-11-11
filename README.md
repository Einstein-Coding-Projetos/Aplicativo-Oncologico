# Aplicativo de Assistência Psicológica para Pacientes Oncológicos
## Descrição
O Aplicativo de Assistência Psicológica para Pacientes Oncológicos tem como objetivo oferecer um ambiente digital Por meio de uma interface intuitiva e empática, o app permite o registro diário de sentimentos, acompanhamento psic---
## Funcionalidades Principais
- Diário do Paciente — Registro de sentimentos, progresso e experiências diárias (texto e mídias).
- Agendamento com Psicólogos — Sistema de agendamento com profissionais especializados no cuidado de pacien- Chatbot de IA — Assistente virtual com base em literatura científica, oferecendo respostas validadas e seguras.
- Relatos de Casos — Espaço para compartilhar experiências e promover apoio emocional entre pacientes.
- Motivação Diária — Sistema gamificado de recompensas e notificações, inspirado no modelo de streaks do Duoling- Cadastro e Login — Autenticação segura e individualizada para pacientes e psicólogos.
- Banco de Dados Relacional — Backend em Django com PostgreSQL, garantindo segurança e integridade dos dado

## Tecnologias Utilizadas
| Camada | Tecnologias |
|--------|--------------|
| Frontend | React Native, Expo |
| Backend | Django, Django REST Framework |
| Banco de Dados | PostgreSQL |
| IA (Chatbot) | Integração com API generativa terceirizada |
| Controle de Versão | Git + GitHub Projects |
| Documentação | Markdown, Notion, Figma |

## Como Rodar o Projeto
### Pré-requisitos
- Node.js ≥ 20
- npm ou yarn
- Python ≥ 3.11
- PostgreSQL ≥ 15
- Expo Go (emulador ou app mobile)
- Git

### Instalação do Frontend
- Clone o repositório
  - git clone (url-do-repo-frontend)
- Entre no diretório
  - cd app-onco-frontend
- Instale as dependências
  - npm install
- Inicie o servidor Expo
  - npx expo start (Abra o app Expo Go no celular e escaneie o QR Code gerado no terminal para visualizar o aplicativo.)

### Instalação do Backend
- Clone o repositório
  - git clone (url-do-repo-backend)
- Entre no diretório
  - cd app-onco-backend
- Crie e ative um ambiente virtual
  - python -m venv venv
- Windows
  - venv\Scripts\activate
- macOS/Linux
  - source venv/bin/activate
- Instale as dependências
  - pip install -r requirements.txt

## Estrutura de Desenvolvimento
Branches principais:
- main: versão estável (produção)
- dev: desenvolvimento ativo
- feature/*: novas funcionalidades
Padrão de commits:
feat, fix, docs, chore

## Contribuindo
1. Faça um fork do projeto
2. Crie uma branch: feature/nome-da-feature
3. Faça commit e push
4. Abra um Pull Request para dev
---
## Licença
Projeto sob Licença MIT.
Sinta-se à vontade para contribuir.
