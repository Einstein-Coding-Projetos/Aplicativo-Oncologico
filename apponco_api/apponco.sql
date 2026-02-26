




/* 1. Cria o usuário (role) que o app Django vai usar */
/* IMPORTANTE: Defina uma senha forte aqui e anote-a */
CREATE USER apponco_user WITH PASSWORD 'uma-senha-forte-para-o-dev';

/* 2. Cria o banco de dados */
CREATE DATABASE apponco_db OWNER apponco_user;

/* 3. Garanta as permissões */
GRANT ALL PRIVILEGES ON DATABASE apponco_db TO apponco_user;

ALTER USER apponco_user WITH PASSWORD 'einsteincoding25';