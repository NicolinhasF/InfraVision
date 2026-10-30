ALTER TABLE metricas_infraestrutura
    ADD COLUMN latencia_ms DECIMAL(10, 2) NULL;

ALTER TABLE analises
    ADD COLUMN severidade VARCHAR(20) NULL;
