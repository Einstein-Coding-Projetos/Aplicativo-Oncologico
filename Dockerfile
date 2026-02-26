FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dependências do sistema (inclui libpq para Postgres)
RUN apt-get update \
  && apt-get install -y --no-install-recommends gcc libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Instala dependências Python
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip \
  && pip install -r requirements.txt

# Copia o projeto
COPY . /app
