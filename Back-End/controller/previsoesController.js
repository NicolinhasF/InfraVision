const executeQuery = require('../database/query');

const METODO = 'Persistência do último valor (24h)';

const previsoesController = {
    gerarPrevisoes: async (req, res) => {
        try {
            const historico = await executeQuery(`
                SELECT m.*
                FROM metricas_infraestrutura m
                WHERE m.id = (
                    SELECT m2.id
                    FROM metricas_infraestrutura m2
                    WHERE m2.componente_id = m.componente_id
                    ORDER BY m2.registrado_em DESC, m2.id DESC
                    LIMIT 1
                )
            `);

            await executeQuery(
                'DELETE FROM previsoes WHERE metodo = ?',
                [METODO]
            );

            const metricas = [
                'cpu_percent',
                'memoria_percent',
                'disco_percent',
                'rede_mbps'
            ];

            let total = 0;

            for (const registro of historico) {
                for (const metrica of metricas) {
                    const valor = registro[metrica];

                    if (valor === null || valor === undefined) continue;
                    if (!Number.isFinite(Number(valor))) continue;

                    await executeQuery(`
                        INSERT INTO previsoes
                        (componente_id, metrica, valor_previsto,
                         periodo_previsto, metodo, risco)
                        VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), ?, NULL)
                    `, [
                        registro.componente_id,
                        metrica,
                        Number(valor),
                        METODO
                    ]);

                    total++;
                }
            }

            return res.status(200).json({
                mensagem: 'Previsões geradas com base nas últimas medições.',
                total
            });

        } catch (error) {
            console.error('Erro ao gerar previsões:', error);

            return res.status(500).json({
                mensagem: 'Erro ao gerar previsões.'
            });
        }
    }
};

module.exports = previsoesController;