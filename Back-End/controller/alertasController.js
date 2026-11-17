const executeQuery = require('../database/query');

const METRICAS_ALERTA = [
    { campo: 'cpu_percent', campoLimite: 'alerta_cpu', label: 'CPU' },
    { campo: 'memoria_percent', campoLimite: 'alerta_ram', label: 'RAM' },
    { campo: 'disco_percent', campoLimite: 'alerta_disco', label: 'Disco' },
];

function gerarAlertas(metricas, configuracao) {
    const alertas = [];

    for (const metrica of metricas) {
        for (const definicao of METRICAS_ALERTA) {
            const limite = Number(configuracao[definicao.campoLimite]);
            const valor = metrica[definicao.campo] === null
                ? null
                : Number(metrica[definicao.campo]);

            if (
                !Number.isFinite(limite) ||
                limite <= 0 ||
                !Number.isFinite(valor) ||
                valor < limite
            ) {
                continue;
            }

            const severidade = valor >= 95 ? 'critico' : 'alto';
            if (severidade === 'critico' && !Boolean(configuracao.alertas_criticos)) {
                continue;
            }

            alertas.push({
                id: `${metrica.componente_id}-${definicao.campo}`,
                componente_id: Number(metrica.componente_id),
                componente: metrica.componente,
                metrica: definicao.label,
                valor,
                limite,
                severidade,
                mensagem: `${definicao.label} do servidor ${metrica.componente} está elevada (${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%; limite: ${limite.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%).`,
            });
        }
    }

    const ordemSeveridade = { critico: 0, alto: 1 };
    return alertas.sort((a, b) =>
        ordemSeveridade[a.severidade] - ordemSeveridade[b.severidade] ||
        b.valor - a.valor
    );
}

const alertasController = {
    listar: async (req, res) => {
        try {
            const configuracoes = await executeQuery(
                `SELECT atualizacao_automatica, intervalo_atualizacao,
                        alertas_criticos, alerta_cpu, alerta_ram, alerta_disco
                 FROM configuracoes_sistema
                 WHERE id = 1`
            );

            const configuracao = configuracoes[0];
            if (!configuracao) {
                return res.status(200).json({
                    total: 0,
                    dados: [],
                    atualizacao_automatica: false,
                    intervalo_minutos: 5,
                });
            }

            const intervalosPermitidos = new Set([1, 5, 10, 15, 30]);
            const intervalo = Number(configuracao.intervalo_atualizacao);
            const intervaloMinutos = intervalosPermitidos.has(intervalo)
                ? intervalo
                : 5;

            if (
                Number(configuracao.alerta_cpu) <= 0 &&
                Number(configuracao.alerta_ram) <= 0 &&
                Number(configuracao.alerta_disco) <= 0
            ) {
                return res.status(200).json({
                    total: 0,
                    dados: [],
                    atualizacao_automatica: Boolean(configuracao.atualizacao_automatica),
                    intervalo_minutos: intervaloMinutos,
                });
            }

            const metricas = await executeQuery(
                `SELECT c.id AS componente_id, c.nome AS componente,
                        m.cpu_percent, m.memoria_percent, m.disco_percent,
                        m.registrado_em
                 FROM componente_infraestrutura c
                 INNER JOIN metricas_infraestrutura m
                    ON m.id = (
                        SELECT m2.id
                        FROM metricas_infraestrutura m2
                        WHERE m2.componente_id = c.id
                        ORDER BY m2.registrado_em DESC, m2.id DESC
                        LIMIT 1
                    )
                 WHERE LOWER(c.tipo) = 'servidor'
                 ORDER BY c.nome`
            );
            const dados = gerarAlertas(metricas, configuracao);

            return res.status(200).json({
                total: dados.length,
                dados,
                atualizacao_automatica: Boolean(configuracao.atualizacao_automatica),
                intervalo_minutos: intervaloMinutos,
            });
        } catch (erro) {
            console.error('Erro ao consultar alertas de infraestrutura:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível carregar os alertas de infraestrutura.',
            });
        }
    },
};

module.exports = { alertasController, gerarAlertas };
