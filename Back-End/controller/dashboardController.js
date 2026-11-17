const executeQuery = require('../database/query');
const { gerarAlertas } = require('./alertasController');

const LIMITES_PADRAO = {
    alerta_cpu: 80,
    alerta_ram: 85,
    alerta_disco: 90,
};

const CAMPOS_METRICAS = [
    { campo: 'cpu_percent', limite: 'alerta_cpu' },
    { campo: 'memoria_percent', limite: 'alerta_ram' },
    { campo: 'disco_percent', limite: 'alerta_disco' },
];

function numeroOuNulo(valor) {
    if (valor === null || valor === undefined) return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function media(valores) {
    const validos = valores.map(numeroOuNulo).filter((valor) => valor !== null);
    if (validos.length === 0) return null;
    return Number((validos.reduce((total, valor) => total + valor, 0) / validos.length).toFixed(2));
}

function limitesDeStatus(configuracao = {}) {
    return Object.fromEntries(
        Object.entries(LIMITES_PADRAO).map(([campo, limitePadrao]) => {
            const valor = numeroOuNulo(configuracao[campo]);
            return [campo, valor !== null && valor > 0 ? valor : limitePadrao];
        })
    );
}

function classificarStatus(servidores, configuracao) {
    const limites = limitesDeStatus(configuracao);
    const status = { normal: 0, atencao: 0, critico: 0, sem_dados: 0 };

    for (const servidor of servidores) {
        const metricasValidas = CAMPOS_METRICAS
            .map(({ campo }) => numeroOuNulo(servidor[campo]))
            .filter((valor) => valor !== null);

        if (metricasValidas.length === 0) {
            status.sem_dados += 1;
            continue;
        }

        const critico = metricasValidas.some((valor) => valor >= 95);
        const atencao = CAMPOS_METRICAS.some(({ campo, limite }) => {
            const valor = numeroOuNulo(servidor[campo]);
            return valor !== null && valor >= limites[limite];
        });

        if (critico) status.critico += 1;
        else if (atencao) status.atencao += 1;
        else status.normal += 1;
    }

    return status;
}

function normalizarMetrica(linha) {
    return {
        ...linha,
        cpu_percent: numeroOuNulo(linha.cpu_percent),
        memoria_percent: numeroOuNulo(linha.memoria_percent),
        disco_percent: numeroOuNulo(linha.disco_percent),
    };
}

const dashboardController = {
    buscar: async (req, res) => {
        try {
            const [
                servidoresBrutos,
                historicoBruto,
                custosBrutos,
                recomendacoes,
                previsoes,
                configuracoes,
            ] = await Promise.all([
                executeQuery(`
                    SELECT c.id AS componente_id, c.nome AS componente,
                           m.cpu_percent, m.memoria_percent, m.disco_percent,
                           m.registrado_em
                    FROM componente_infraestrutura AS c
                    LEFT JOIN metricas_infraestrutura AS m
                        ON m.id = (
                            SELECT m2.id
                            FROM metricas_infraestrutura AS m2
                            WHERE m2.componente_id = c.id
                            ORDER BY m2.registrado_em DESC, m2.id DESC
                            LIMIT 1
                        )
                    WHERE LOWER(c.tipo) = 'servidor'
                    ORDER BY c.nome
                `),
                executeQuery(`
                    SELECT DATE_FORMAT(m.registrado_em, '%Y-%m-%d %H:%i:%s') AS periodo,
                           AVG(m.cpu_percent) AS cpu,
                           AVG(m.memoria_percent) AS ram
                    FROM metricas_infraestrutura AS m
                    INNER JOIN componente_infraestrutura AS c
                        ON c.id = m.componente_id
                    WHERE LOWER(c.tipo) = 'servidor'
                      AND m.registrado_em IN (
                          SELECT periodos.registrado_em
                          FROM (
                              SELECT DISTINCT m2.registrado_em
                              FROM metricas_infraestrutura AS m2
                              INNER JOIN componente_infraestrutura AS c2
                                  ON c2.id = m2.componente_id
                              WHERE LOWER(c2.tipo) = 'servidor'
                              ORDER BY m2.registrado_em DESC
                              LIMIT 24
                          ) AS periodos
                      )
                    GROUP BY m.registrado_em
                    ORDER BY m.registrado_em
                `),
                executeQuery(`
                    SELECT ci.componente_id, ci.custo_total,
                           DATEDIFF(ci.periodo_fim, ci.periodo_inicio) + 1 AS dias_periodo
                    FROM custos_infraestrutura AS ci
                    WHERE ci.id = (
                        SELECT ci2.id
                        FROM custos_infraestrutura AS ci2
                        WHERE ci2.componente_id = ci.componente_id
                        ORDER BY ci2.calculado_em DESC, ci2.id DESC
                        LIMIT 1
                    )
                `),
                executeQuery(`
                    SELECT COUNT(*) AS total
                    FROM analises
                    WHERE tipo = 'recomendacao_ia'
                `),
                executeQuery(`
                    SELECT p.id, p.componente_id, c.nome AS servidor,
                           p.metrica, p.valor_previsto, p.periodo_previsto, p.risco
                    FROM previsoes AS p
                    INNER JOIN componente_infraestrutura AS c
                        ON c.id = p.componente_id
                    WHERE LOWER(c.tipo) = 'servidor'
                      AND p.metrica IN ('cpu_percent', 'memoria_percent', 'disco_percent')
                    ORDER BY
                        CASE WHEN p.periodo_previsto >= NOW() THEN 0 ELSE 1 END,
                        CASE LOWER(COALESCE(p.risco, ''))
                            WHEN 'critico' THEN 0
                            WHEN 'critical' THEN 0
                            WHEN 'alto' THEN 1
                            WHEN 'high' THEN 1
                            WHEN 'medio' THEN 2
                            WHEN 'médio' THEN 2
                            WHEN 'medium' THEN 2
                            WHEN 'baixo' THEN 3
                            WHEN 'low' THEN 3
                            ELSE 4
                        END,
                        COALESCE(p.valor_previsto, 0) DESC,
                        p.periodo_previsto DESC
                    LIMIT 1
                `),
                executeQuery(`
                    SELECT alerta_cpu, alerta_ram, alerta_disco, alertas_criticos
                    FROM configuracoes_sistema
                    WHERE id = 1
                `),
            ]);

            const servidores = servidoresBrutos.map(normalizarMetrica);
            const configuracao = configuracoes[0] || {
                ...LIMITES_PADRAO,
                alertas_criticos: true,
            };
            const alertas = gerarAlertas(servidores, configuracao)
                .map((alerta) => ({
                    ...alerta,
                    registrado_em: servidores.find(
                        (servidor) => Number(servidor.componente_id) === alerta.componente_id
                    )?.registrado_em || null,
                }))
                .sort((a, b) => {
                    const dataA = a.registrado_em ? new Date(a.registrado_em).getTime() : 0;
                    const dataB = b.registrado_em ? new Date(b.registrado_em).getTime() : 0;
                    return dataB - dataA;
                })
                .slice(0, 5);

            const custos = custosBrutos.map((custo) => {
                const dias = Math.max(1, Number(custo.dias_periodo) || 1);
                return Number(custo.custo_total) * 30 / dias;
            });
            const custoMensal = custos.length
                ? Number(custos.reduce((total, custo) => total + custo, 0).toFixed(2))
                : null;

            const previsao = previsoes[0] ? {
                id: Number(previsoes[0].id),
                servidor: previsoes[0].servidor,
                metrica: previsoes[0].metrica,
                valor_previsto: numeroOuNulo(previsoes[0].valor_previsto),
                periodo_previsto: previsoes[0].periodo_previsto,
                risco: previsoes[0].risco,
            } : null;

            return res.status(200).json({
                metricas: {
                    servidores_total: servidores.length,
                    cpu_media: media(servidores.map((servidor) => servidor.cpu_percent)),
                    ram_media: media(servidores.map((servidor) => servidor.memoria_percent)),
                    custo_mensal: custoMensal,
                },
                historico: historicoBruto.map((registro) => ({
                    periodo: registro.periodo,
                    cpu: numeroOuNulo(registro.cpu),
                    ram: numeroOuNulo(registro.ram),
                })),
                status: classificarStatus(servidores, configuracao),
                economia_potencial: {
                    valor: null,
                    recomendacoes: Number(recomendacoes[0]?.total || 0),
                    motivo: 'As recomendações cadastradas não informam uma economia monetária estimada.',
                },
                alertas,
                previsao,
            });
        } catch (erro) {
            console.error('Erro ao carregar dados do Dashboard:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível carregar os dados do Dashboard.',
            });
        }
    },
};

module.exports = { dashboardController, classificarStatus, media };
