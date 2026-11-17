ALTER TABLE analises
    ADD COLUMN beneficio TEXT NULL,
    ADD COLUMN impacto TEXT NULL,
    ADD COLUMN justificativa TEXT NULL,
    ADD COLUMN chave_recomendacao CHAR(64) NULL,
    ADD UNIQUE KEY uq_analises_chave_recomendacao (chave_recomendacao);
