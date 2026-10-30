INSERT INTO componente_infraestrutura (nome, tipo, descricao, status)
SELECT 'Servidor Web Principal', 'servidor', 'Servidor principal da aplicacao Infravision.', 'ativo'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM componente_infraestrutura WHERE nome = 'Servidor Web Principal'
);

INSERT INTO componente_infraestrutura (nome, tipo, descricao, status)
SELECT 'Servidor Banco de Dados', 'servidor', 'Servidor MySQL de infraestrutura.', 'ativo'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM componente_infraestrutura WHERE nome = 'Servidor Banco de Dados'
);

INSERT INTO componente_infraestrutura (nome, tipo, descricao, status)
SELECT 'Roteador Matriz', 'roteador', 'Roteador de borda da matriz.', 'ativo'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM componente_infraestrutura WHERE nome = 'Roteador Matriz'
);

INSERT INTO componente_infraestrutura (nome, tipo, descricao, status)
SELECT 'Servidor de Backup', 'servidor', 'Servidor destinado a copias de seguranca.', 'ativo'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM componente_infraestrutura WHERE nome = 'Servidor de Backup'
);

INSERT INTO metricas_infraestrutura
    (componente_id, cpu_percent, memoria_percent, disco_percent, rede_mbps, latencia_ms, registrado_em)
SELECT c.id, 78.50, 72.00, 64.30, 185.40, 18.20, '2026-10-29 09:00:00'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor Web Principal'
  AND NOT EXISTS (
      SELECT 1 FROM metricas_infraestrutura AS m
      WHERE m.componente_id = c.id AND m.registrado_em = '2026-10-29 09:00:00'
  );

INSERT INTO metricas_infraestrutura
    (componente_id, cpu_percent, memoria_percent, disco_percent, rede_mbps, latencia_ms, registrado_em)
SELECT c.id, 91.20, 84.60, 79.00, 96.70, 5.80, '2026-10-29 09:00:00'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor Banco de Dados'
  AND NOT EXISTS (
      SELECT 1 FROM metricas_infraestrutura AS m
      WHERE m.componente_id = c.id AND m.registrado_em = '2026-10-29 09:00:00'
  );

INSERT INTO metricas_infraestrutura
    (componente_id, cpu_percent, memoria_percent, disco_percent, rede_mbps, latencia_ms, registrado_em)
SELECT c.id, 34.10, 48.20, 52.00, 410.50, 2.40, '2026-10-29 09:00:00'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Roteador Matriz'
  AND NOT EXISTS (
      SELECT 1 FROM metricas_infraestrutura AS m
      WHERE m.componente_id = c.id AND m.registrado_em = '2026-10-29 09:00:00'
  );

INSERT INTO metricas_infraestrutura
    (componente_id, cpu_percent, memoria_percent, disco_percent, rede_mbps, latencia_ms, registrado_em)
SELECT c.id, 22.70, 39.50, 68.10, 42.30, 11.60, '2026-10-29 09:00:00'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor de Backup'
  AND NOT EXISTS (
      SELECT 1 FROM metricas_infraestrutura AS m
      WHERE m.componente_id = c.id AND m.registrado_em = '2026-10-29 09:00:00'
  );

INSERT INTO analises
    (componente_id, tipo, resultado, recomendacao, modelo_ia, severidade)
SELECT c.id, 'capacidade', 'Uso de CPU elevado, mas dentro do limite operacional.', 'Acompanhar a tendencia de CPU nas proximas coletas.', 'seed-dados-teste', 'media'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor Web Principal'
  AND NOT EXISTS (
      SELECT 1 FROM analises AS a
      WHERE a.componente_id = c.id AND a.tipo = 'capacidade' AND a.modelo_ia = 'seed-dados-teste'
  );

INSERT INTO analises
    (componente_id, tipo, resultado, recomendacao, modelo_ia, severidade)
SELECT c.id, 'capacidade', 'CPU e memoria proximas da capacidade maxima.', 'Investigar consultas pesadas e planejar aumento de capacidade.', 'seed-dados-teste', 'critica'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor Banco de Dados'
  AND NOT EXISTS (
      SELECT 1 FROM analises AS a
      WHERE a.componente_id = c.id AND a.tipo = 'capacidade' AND a.modelo_ia = 'seed-dados-teste'
  );

INSERT INTO analises
    (componente_id, tipo, resultado, recomendacao, modelo_ia, severidade)
SELECT c.id, 'rede', 'Metricas do roteador estaveis, sem saturacao detectada.', 'Manter o monitoramento periodico.', 'seed-dados-teste', 'baixa'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Roteador Matriz'
  AND NOT EXISTS (
      SELECT 1 FROM analises AS a
      WHERE a.componente_id = c.id AND a.tipo = 'rede' AND a.modelo_ia = 'seed-dados-teste'
  );

INSERT INTO analises
    (componente_id, tipo, resultado, recomendacao, modelo_ia, severidade)
SELECT c.id, 'armazenamento', 'Espaco em disco crescente no servidor de backup.', 'Revisar retencao de backups e capacidade disponivel.', 'seed-dados-teste', 'alta'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor de Backup'
  AND NOT EXISTS (
      SELECT 1 FROM analises AS a
      WHERE a.componente_id = c.id AND a.tipo = 'armazenamento' AND a.modelo_ia = 'seed-dados-teste'
  );

INSERT INTO previsoes
    (componente_id, metrica, valor_previsto, periodo_previsto, metodo, risco)
SELECT c.id, 'cpu_percent', 95.00, '2026-11-30 09:00:00', 'tendencia-teste', 'alto'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor Web Principal'
  AND NOT EXISTS (
      SELECT 1 FROM previsoes AS p
      WHERE p.componente_id = c.id AND p.metrica = 'cpu_percent'
        AND p.periodo_previsto = '2026-11-30 09:00:00' AND p.metodo = 'tendencia-teste'
  );

INSERT INTO previsoes
    (componente_id, metrica, valor_previsto, periodo_previsto, metodo, risco)
SELECT c.id, 'cpu_percent', 97.00, '2026-11-30 09:00:00', 'tendencia-teste', 'critico'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor Banco de Dados'
  AND NOT EXISTS (
      SELECT 1 FROM previsoes AS p
      WHERE p.componente_id = c.id AND p.metrica = 'cpu_percent'
        AND p.periodo_previsto = '2026-11-30 09:00:00' AND p.metodo = 'tendencia-teste'
  );

INSERT INTO previsoes
    (componente_id, metrica, valor_previsto, periodo_previsto, metodo, risco)
SELECT c.id, 'latencia_ms', 3.50, '2026-11-30 09:00:00', 'tendencia-teste', 'baixo'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Roteador Matriz'
  AND NOT EXISTS (
      SELECT 1 FROM previsoes AS p
      WHERE p.componente_id = c.id AND p.metrica = 'latencia_ms'
        AND p.periodo_previsto = '2026-11-30 09:00:00' AND p.metodo = 'tendencia-teste'
  );

INSERT INTO previsoes
    (componente_id, metrica, valor_previsto, periodo_previsto, metodo, risco)
SELECT c.id, 'disco_percent', 86.00, '2026-11-30 09:00:00', 'tendencia-teste', 'medio'
FROM componente_infraestrutura AS c
WHERE c.nome = 'Servidor de Backup'
  AND NOT EXISTS (
      SELECT 1 FROM previsoes AS p
      WHERE p.componente_id = c.id AND p.metrica = 'disco_percent'
        AND p.periodo_previsto = '2026-11-30 09:00:00' AND p.metodo = 'tendencia-teste'
  );

INSERT INTO relacionamento_infraestrutura
    (componente_origem_id, componente_destino_id, tipo_relacionamento, descricao)
SELECT origem.id, destino.id, 'depende_de', 'O servidor web depende do banco para persistir dados.'
FROM componente_infraestrutura AS origem
INNER JOIN componente_infraestrutura AS destino
    ON destino.nome = 'Servidor Banco de Dados'
WHERE origem.nome = 'Servidor Web Principal'
  AND NOT EXISTS (
      SELECT 1 FROM relacionamento_infraestrutura AS r
      WHERE r.componente_origem_id = origem.id
        AND r.componente_destino_id = destino.id
        AND r.tipo_relacionamento = 'depende_de'
  );

INSERT INTO relacionamento_infraestrutura
    (componente_origem_id, componente_destino_id, tipo_relacionamento, descricao)
SELECT origem.id, destino.id, 'conectado_a', 'O servidor web utiliza a rede da matriz.'
FROM componente_infraestrutura AS origem
INNER JOIN componente_infraestrutura AS destino
    ON destino.nome = 'Roteador Matriz'
WHERE origem.nome = 'Servidor Web Principal'
  AND NOT EXISTS (
      SELECT 1 FROM relacionamento_infraestrutura AS r
      WHERE r.componente_origem_id = origem.id
        AND r.componente_destino_id = destino.id
        AND r.tipo_relacionamento = 'conectado_a'
  );

INSERT INTO relacionamento_infraestrutura
    (componente_origem_id, componente_destino_id, tipo_relacionamento, descricao)
SELECT origem.id, destino.id, 'backup_de', 'O servidor de backup armazena copias do banco de dados.'
FROM componente_infraestrutura AS origem
INNER JOIN componente_infraestrutura AS destino
    ON destino.nome = 'Servidor Banco de Dados'
WHERE origem.nome = 'Servidor de Backup'
  AND NOT EXISTS (
      SELECT 1 FROM relacionamento_infraestrutura AS r
      WHERE r.componente_origem_id = origem.id
        AND r.componente_destino_id = destino.id
        AND r.tipo_relacionamento = 'backup_de'
  );
