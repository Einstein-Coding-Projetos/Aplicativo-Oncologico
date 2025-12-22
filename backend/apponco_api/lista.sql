DROP TABLE IF EXISTS agendamentos;

CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    nome_psicologo VARCHAR(100),
    dia VARCHAR(50),
    horario VARCHAR(50)
);
-- 1. Libera mexer na tabela
GRANT ALL PRIVILEGES ON TABLE agendamentos TO apponco_user;

-- 2. Libera mexer no contador automático do ID (MUITO IMPORTANTE)
GRANT ALL PRIVILEGES ON SEQUENCE agendamentos_id_seq TO apponco_user;

SELECT * FROM agendamentos;
