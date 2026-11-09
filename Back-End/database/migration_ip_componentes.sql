-- Migração para armazenar o IP de cada componente de infraestrutura.
-- Execute no banco infravision pelo phpMyAdmin (aba SQL).
-- A criação da coluna é condicional: pode executar o arquivo novamente sem erro.

SET @coluna_ip_existe := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'componente_infraestrutura'
      AND COLUMN_NAME = 'ip'
);

SET @sql_migracao := IF(
    @coluna_ip_existe = 0,
    'ALTER TABLE componente_infraestrutura ADD COLUMN ip VARCHAR(45) NULL AFTER nome',
    'SELECT "A coluna ip já existe; nenhuma alteração estrutural necessária." AS mensagem'
);

PREPARE stmt_ip FROM @sql_migracao;
EXECUTE stmt_ip;
DEALLOCATE PREPARE stmt_ip;

-- Endereços privados fictícios para os componentes de demonstração.
-- Atualize-os caso os servidores tenham IPs reais diferentes.
UPDATE componente_infraestrutura
SET ip = CASE nome
    WHEN 'Servidor Web Principal' THEN '192.168.1.10'
    WHEN 'Servidor Banco de Dados' THEN '192.168.1.11'
    WHEN 'Servidor de Backup' THEN '192.168.1.12'
    WHEN 'Servidor de Aplicação 02' THEN '192.168.1.13'
    WHEN 'Servidor de Arquivos' THEN '192.168.1.14'
    WHEN 'Roteador Matriz' THEN '192.168.1.1'
    ELSE ip
END
WHERE nome IN (
    'Servidor Web Principal',
    'Servidor Banco de Dados',
    'Servidor de Backup',
    'Servidor de Aplicação 02',
    'Servidor de Arquivos',
    'Roteador Matriz'
);

-- Conferência dos endereços cadastrados.
SELECT id, nome, tipo, ip, status
FROM componente_infraestrutura
ORDER BY nome;
