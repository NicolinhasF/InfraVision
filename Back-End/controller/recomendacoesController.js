const recomendacoesModel = require('../models/recomendacoesModel');
const { gerarRecomendacoes } = require('../services/aiService');

const CAMPOS_PERCENTUAIS = ['cpu_percent', 'memoria_percent', 'disco_percent'];
const CAMPOS_METRICAS = [
    ...CAMPOS_PERCENTUAIS,
    'rede_mbps',
    'latencia_ms',
];

function normalizarMetricas(linhas) {
    return linhas.map((linha) => {
        const metrica = {
            componente_id: Number(linha.componente_id),
            componente: linha.componente,
            registrado_em: linha.registrado_em,
        };

        for (const campo of CAMPOS_METRICAS) {
            const valor = linha[campo] === null || linha[campo] === undefined
                ? null
                : Number(linha[campo]);
            const valido = Number.isFinite(valor) &&
                (CAMPOS_PERCENTUAIS.includes(campo)
                    ? valor >= 0 && valor <= 100
                    : valor >= 0);

            metrica[campo] = valido ? valor : null;
        }

        return metrica;
    }).filter((metrica) => CAMPOS_METRICAS.some((campo) => metrica[campo] !== null));
}

const recomendacoesController = {
    listar: async (req, res) => {
        try {
            const dados = await recomendacoesModel.listar();
            return res.status(200).json({
                total: dados.length,
                dados,
                justificativa: dados[0]?.justificativa ||
                    'As recomendações são baseadas nas métricas e análises registradas no banco de dados.',
            });
        } catch (erro) {
            console.error('Erro ao carregar recomendações:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível carregar as recomendações.',
            });
        }
    },

    gerar: async (req, res) => {
        let metricas;

        try {
            const linhas = await recomendacoesModel.buscarMetricasRecentes();
            metricas = normalizarMetricas(linhas);

            if (metricas.length === 0) {
                return res.status(422).json({
                    erro: 'Não existem métricas suficientes para gerar recomendações confiáveis.',
                });
            }
        } catch (erro) {
            console.error('Erro ao consultar métricas para recomendações:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível consultar as métricas para gerar recomendações.',
            });
        }

        let analises;
        try {
            analises = await recomendacoesModel.buscarAnalisesRecentes(
                metricas.map((item) => item.componente_id)
            );
        } catch (erro) {
            console.error('Erro ao consultar análises para recomendações:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível consultar as análises existentes.',
            });
        }

        try {
            if (!(await recomendacoesModel.temEstruturaPersistencia())) {
                return res.status(503).json({
                    erro: 'A geração de recomendações ainda não está preparada no banco. Execute Back-End/database/migration_recomendacoes.sql.',
                });
            }
        } catch (erro) {
            console.error('Erro ao verificar a estrutura das recomendações:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível verificar a estrutura necessária para salvar recomendações.',
            });
        }

        let resultadoIA;
        try {
            resultadoIA = await gerarRecomendacoes(metricas, analises);
        } catch (erro) {
            console.error('Erro ao gerar recomendações com IA:', erro.message);
            return res.status(502).json({
                erro: 'Não foi possível gerar recomendações válidas com o serviço de IA.',
            });
        }

        try {
            await recomendacoesModel.salvarTodas(
                resultadoIA.recomendacoes,
                resultadoIA.modelo,
                resultadoIA.justificativa
            );

            const dados = await recomendacoesModel.listar();
            return res.status(200).json({
                total: resultadoIA.recomendacoes.length,
                dados,
                justificativa: resultadoIA.justificativa,
            });
        } catch (erro) {
            console.error('Erro ao salvar recomendações:', erro.message);
            return res.status(500).json({
                erro: 'As recomendações foram geradas, mas não puderam ser salvas.',
            });
        }
    },
};

module.exports = recomendacoesController;
