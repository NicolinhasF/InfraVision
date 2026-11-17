const crypto = require('crypto');
const executeQuery = require('../database/query');

async function obterColunasExtras() {
    const colunas = await executeQuery(
        `SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'analises'
           AND COLUMN_NAME IN ('beneficio', 'impacto', 'justificativa', 'chave_recomendacao')`
    );

    return new Set(colunas.map((coluna) => coluna.COLUMN_NAME));
}

const recomendacoesModel = {
    listar: async () => {
        const colunas = await obterColunasExtras();
        const beneficio = colunas.has('beneficio') ? 'a.beneficio' : 'NULL AS beneficio';
        const impacto = colunas.has('impacto') ? 'a.impacto' : 'NULL AS impacto';
        const justificativa = colunas.has('justificativa')
            ? 'a.justificativa'
            : 'NULL AS justificativa';

        return executeQuery(
            `SELECT a.id, a.componente_id, c.nome AS componente,
                    a.resultado, a.recomendacao, a.severidade, a.modelo_ia,
                    ${beneficio}, ${impacto}, ${justificativa}, a.criado_em
         FROM analises a
         LEFT JOIN componente_infraestrutura c ON c.id = a.componente_id
         WHERE a.tipo = 'recomendacao_ia'
         ORDER BY a.criado_em DESC, a.id DESC
         LIMIT 50`
        );
    },

    temEstruturaPersistencia: async () => {
        const colunas = await obterColunasExtras();
        return ['beneficio', 'impacto', 'justificativa', 'chave_recomendacao']
            .every((coluna) => colunas.has(coluna));
    },

    buscarMetricasRecentes: async () => executeQuery(
        `SELECT m.componente_id, c.nome AS componente,
                m.cpu_percent, m.memoria_percent, m.disco_percent,
                m.rede_mbps, m.latencia_ms, m.registrado_em
         FROM metricas_infraestrutura m
         INNER JOIN componente_infraestrutura c ON c.id = m.componente_id
         WHERE m.id = (
             SELECT m2.id
             FROM metricas_infraestrutura m2
             WHERE m2.componente_id = m.componente_id
             ORDER BY m2.registrado_em DESC, m2.id DESC
             LIMIT 1
         )
         ORDER BY c.nome`
    ),

    buscarAnalisesRecentes: async (componenteIds) => {
        if (componenteIds.length === 0) return [];

        const placeholders = componenteIds.map(() => '?').join(', ');
        return executeQuery(
            `SELECT componente_id, tipo, resultado, recomendacao, severidade,
                    modelo_ia, criado_em
             FROM analises
             WHERE componente_id IN (${placeholders})
               AND tipo <> 'recomendacao_ia'
             ORDER BY criado_em DESC, id DESC
             LIMIT 100`,
            componenteIds
        );
    },

    salvarTodas: async (recomendacoes, modelo, justificativa) => {
        if (recomendacoes.length === 0) return;

        const valores = recomendacoes.map((recomendacao) => {
            const chave = crypto.createHash('sha256')
                .update(JSON.stringify([
                    recomendacao.componente_id,
                    recomendacao.titulo.toLocaleLowerCase('pt-BR'),
                    recomendacao.prioridade,
                    recomendacao.sugestao.toLocaleLowerCase('pt-BR'),
                    recomendacao.beneficio,
                    recomendacao.impacto.toLocaleLowerCase('pt-BR'),
                ]))
                .digest('hex');

            return [
                recomendacao.componente_id,
                recomendacao.titulo,
                recomendacao.sugestao,
                modelo,
                recomendacao.prioridade,
                recomendacao.beneficio,
                recomendacao.impacto,
                justificativa,
                chave,
            ];
        });
        const placeholders = valores
            .map(() => "(?, 'recomendacao_ia', ?, ?, ?, ?, ?, ?, ?, ?)")
            .join(', ');

        await executeQuery(
            `INSERT INTO analises
                (componente_id, tipo, resultado, recomendacao, modelo_ia,
                 severidade, beneficio, impacto, justificativa,
                 chave_recomendacao)
             VALUES ${placeholders}
             ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
            valores.flat()
        );
    },
};

module.exports = recomendacoesModel;
