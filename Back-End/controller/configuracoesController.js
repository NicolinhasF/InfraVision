const configuracoesModel = require('../models/configuracoesModel');

const CAMPOS_BOOLEANOS = [
    'atualizacao_automatica',
    'alertas_criticos',
    'alertas_economia',
    'alerta_cpu',
    'alerta_ram',
    'alerta_disco',
];
const CAMPOS_LIMITE = ['limite_cpu', 'limite_ram', 'limite_disco'];
const CAMPOS_PERMITIDOS = new Set([
    ...CAMPOS_BOOLEANOS,
    'intervalo_minutos',
    ...CAMPOS_LIMITE,
]);
const INTERVALOS_PERMITIDOS = [1, 5, 10, 15, 30];

function validarConfiguracao(atual, alteracoes) {
    if (
        !alteracoes ||
        typeof alteracoes !== 'object' ||
        Array.isArray(alteracoes)
    ) {
        return { erro: 'Informe um objeto de configurações válido.' };
    }

    const campoDesconhecido = Object.keys(alteracoes)
        .find((campo) => !CAMPOS_PERMITIDOS.has(campo));

    if (campoDesconhecido) {
        return { erro: `O campo ${campoDesconhecido} não pode ser atualizado.` };
    }

    const configuracao = { ...atual };

    for (const campo of CAMPOS_BOOLEANOS) {
        if (Object.hasOwn(alteracoes, campo)) {
            if (typeof alteracoes[campo] !== 'boolean') {
                return { erro: `O campo ${campo} deve ser booleano.` };
            }
            configuracao[campo] = alteracoes[campo];
        }
    }

    if (Object.hasOwn(alteracoes, 'intervalo_minutos')) {
        const intervalo = alteracoes.intervalo_minutos;

        if (!INTERVALOS_PERMITIDOS.includes(intervalo)) {
            return { erro: 'O intervalo deve ser 1, 5, 10, 15 ou 30 minutos.' };
        }
        configuracao.intervalo_minutos = intervalo;
    }

    for (const campo of CAMPOS_LIMITE) {
        if (Object.hasOwn(alteracoes, campo)) {
            const limite = alteracoes[campo];

            if (
                typeof limite !== 'number' ||
                !Number.isFinite(limite) ||
                limite < 0 ||
                limite > 100
            ) {
                return { erro: `O campo ${campo} deve estar entre 0 e 100.` };
            }
            configuracao[campo] = limite;
        }
    }

    return { configuracao };
}

const configuracoesController = {
    buscar: async (req, res) => {
        try {
            const dados = await configuracoesModel.buscar();
            return res.status(200).json({ dados });
        } catch (erro) {
            console.error('Erro ao carregar configurações:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível carregar as configurações.',
            });
        }
    },

    atualizar: async (req, res) => {
        try {
            const atual = await configuracoesModel.buscar();
            const validacao = validarConfiguracao(atual, req.body);
            if (validacao.erro) {
                return res.status(400).json({ erro: validacao.erro });
            }

            const dados = await configuracoesModel.atualizar(
                validacao.configuracao
            );

            return res.status(200).json({ dados });
        } catch (erro) {
            console.error('Erro ao atualizar configurações:', erro.message);
            return res.status(500).json({
                erro: 'Não foi possível atualizar as configurações.',
            });
        }
    },
};

module.exports = { configuracoesController, validarConfiguracao };
