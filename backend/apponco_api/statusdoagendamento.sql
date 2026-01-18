DROP TABLE IF EXISTS alunos;
DROP TYPE IF EXISTS status_registro CASCADE;

CREATE TYPE status_registro AS ENUM (
    'agendado',
    'pendente',
    'concluido'
);

-- 2. Depois cria a tabela
CREATE TABLE alunos (
    id SERIAL PRIMARY KEY,
	profissional 	varchar(100) not null,
    date DATE NOT NULL,     
    hora VARCHAR(10) NOT NULL,
    status status_registro DEFAULT 'agendado'
);

-- 1. Libera mexer na tabela
GRANT ALL PRIVILEGES ON TABLE alunos TO apponco_user;

-- 2. Libera mexer no contador automático do ID (MUITO IMPORTANTE)
GRANT ALL PRIVILEGES ON SEQUENCE alunos_id_seq TO apponco_user;

SELECT * FROM alunos;