const executeQuery = require('../database/query');

const CAMPOS_METRICA = {
    cpu: 'cpu_percent',
    cpu_percent: 'cpu_percent',
    memoria: 'memoria_percent',
    memoria_percent: 'memoria_percent',
    disco: 'disco_percent',
    disco_percent: 'disco_percent',
    rede: 'rede_mbps',
    rede_mbps: 'rede_mbps',
    latencia: 'latencia_ms',
    latencia_ms: 'latencia_ms',
};

class ErroValidacao extends Error {}

function validarParametroTexto(valor, nome, limite = 100) {
    if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > limite) {
        throw new ErroValidacao(`O parâmetro ${nome} é inválido.`);
    }

    return valor.trim();
}

function validarComponenteId(valor) {
    if (valor === undefined) {
        return null;
    }

    if (
        typeof valor !== 'string' ||
        !/^[1-9]\d*$/.test(valor) ||
        !Number.isSafeInteger(Number(valor))
    ) {
        throw new ErroValidacao('O parâmetro componente_id deve ser um inteiro positivo.');
    }

    return Number(valor);
}

function validarData(valor, nome) {
    if (valor === undefined) {
        return null;
    }

    const partes = typeof valor === 'string'
        ? valor.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?)?$/)
        : null;
    if (!partes || Number.isNaN(Date.parse(`${partes[1]}T00:00:00Z`))) {
        throw new ErroValidacao(`O parâmetro ${nome} deve ser uma data ou data/hora válida.`);
    }

    if (new Date(`${partes[1]}T00:00:00Z`).toISOString().slice(0, 10) !== partes[1]) {
        throw new ErroValidacao(`O parâmetro ${nome} deve ser uma data ou data/hora válida.`);
    }

    if (
        partes[2] !== undefined &&
        (Number(partes[2]) > 23 || Number(partes[3]) > 59 || Number(partes[4] || 0) > 59)
    ) {
        throw new ErroValidacao(`O parâmetro ${nome} deve ser uma data ou data/hora válida.`);
    }

    return valor.replace('T', ' ');
}

function adicionarFiltros(req, opcoes) {
    const queryKeys = Object.keys(req.query);
    const filtrosPermitidos = ['componente_id'];

    if (opcoes.metrica) filtrosPermitidos.push('metrica');
    if (opcoes.data) filtrosPermitidos.push('data_inicio', 'data_fim');

    const filtroNaoSuportado = queryKeys.find((key) => !filtrosPermitidos.includes(key));
    if (filtroNaoSuportado) {
        throw new ErroValidacao(`O filtro ${filtroNaoSuportado} não é compatível com esta consulta.`);
    }

    const condicoes = [];
    const parametros = [];
    const componenteId = validarComponenteId(req.query.componente_id);

    if (componenteId !== null) {
        if (Array.isArray(opcoes.componenteColumn)) {
            condicoes.push(`(${opcoes.componenteColumn.map((coluna) => `${coluna} = ?`).join(' OR ')})`);
            parametros.push(...opcoes.componenteColumn.map(() => componenteId));
        } else {
            condicoes.push(`${opcoes.componenteColumn} = ?`);
            parametros.push(componenteId);
        }
    }

    if (opcoes.metrica && req.query.metrica !== undefined) {
        const metrica = validarParametroTexto(req.query.metrica, 'metrica');
        if (opcoes.metricaComoCampo) {
            const campo = CAMPOS_METRICA[metrica];
            if (!campo) {
                throw new ErroValidacao('O parâmetro metrica não corresponde a um campo de métrica válido.');
            }
            condicoes.push(`${opcoes.metricaColumn}.${campo} IS NOT NULL`);
        } else {
            condicoes.push(`${opcoes.metricaColumn} = ?`);
            parametros.push(metrica);
        }
    }

    if (opcoes.data) {
        const dataInicio = validarData(req.query.data_inicio, 'data_inicio');
        const dataFim = validarData(req.query.data_fim, 'data_fim');

        const dataFimSomente = req.query.data_fim !== undefined &&
            /^\d{4}-\d{2}-\d{2}$/.test(req.query.data_fim);
        const limiteDataFim = dataFim
            ? Date.parse(dataFim.replace(' ', 'T')) + (dataFimSomente ? 86400000 - 1 : 0)
            : null;

        if (dataInicio && dataFim && Date.parse(dataInicio.replace(' ', 'T')) > limiteDataFim) {
            throw new ErroValidacao('data_inicio não pode ser posterior a data_fim.');
        }

        if (dataInicio) {
            condicoes.push(`${opcoes.dataColumn} >= ?`);
            parametros.push(dataInicio);
        }
        if (dataFim) {
            condicoes.push(`${opcoes.dataColumn} ${dataFimSomente ? '< DATE_ADD(?, INTERVAL 1 DAY)' : '<= ?'}`);
            parametros.push(dataFim);
        }
    }

    return {
        where: condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '',
        parametros,
    };
}

async function responderConsulta(res, consulta, montarResposta) {
    try {
        const { sql, parametros = [] } = consulta();
        const linhas = await executeQuery(sql, parametros);
        const dados = montarResposta ? linhas.map(montarResposta) : linhas;

        return res.status(200).json({ total: dados.length, dados });
    } catch (erro) {
        if (erro instanceof ErroValidacao) {
            return res.status(400).json({ erro: erro.message });
        }

        console.error('Erro ao consultar dados de infraestrutura:', erro.message);
        return res.status(500).json({
            erro: 'Não foi possível consultar os dados solicitados.',
        });
    }
}

const infraestruturaController = {
    listarComponentes: (req, res) => responderConsulta(
        res,
        () => ({
            sql: `SELECT id, nome, tipo, descricao, status
                  FROM componente_infraestrutura
                  ORDER BY nome`,
        })
    ),

    listarRelacionamentos: (req, res) => responderConsulta(
        res,
        () => {
            const filtros = adicionarFiltros(req, {
                componenteColumn: ['r.componente_origem_id', 'r.componente_destino_id'],
            });

            return {
                sql: `SELECT r.id, origem.id AS origem_id, origem.nome AS origem_nome,
                             destino.id AS destino_id, destino.nome AS destino_nome,
                             r.tipo_relacionamento AS tipo, r.descricao
                      FROM relacionamento_infraestrutura AS r
                      INNER JOIN componente_infraestrutura AS origem
                          ON origem.id = r.componente_origem_id
                      INNER JOIN componente_infraestrutura AS destino
                          ON destino.id = r.componente_destino_id
                      ${filtros.where}
                      ORDER BY r.id`,
                parametros: filtros.parametros,
            };
        },
        (linha) => ({
            id: linha.id,
            origem: { id: linha.origem_id, nome: linha.origem_nome },
            destino: { id: linha.destino_id, nome: linha.destino_nome },
            tipo: linha.tipo,
            descricao: linha.descricao,
        })
    ),

    listarMetricas: (req, res) => responderConsulta(
        res,
        () => {
            const filtros = adicionarFiltros(req, {
                componenteColumn: 'm.componente_id',
                metrica: true,
                metricaComoCampo: true,
                metricaColumn: 'm',
                data: true,
                dataColumn: 'm.registrado_em',
            });

            return {
                sql: `SELECT c.id AS componente_id, c.nome AS componente_nome,
                             m.cpu_percent, m.memoria_percent, m.disco_percent,
                             m.rede_mbps, m.latencia_ms, m.registrado_em
                      FROM metricas_infraestrutura AS m
                      INNER JOIN componente_infraestrutura AS c ON c.id = m.componente_id
                      ${filtros.where}
                      ORDER BY m.registrado_em DESC`,
                parametros: filtros.parametros,
            };
        },
        (linha) => ({
            componente: { id: linha.componente_id, nome: linha.componente_nome },
            cpu_percent: linha.cpu_percent === null ? null : Number(linha.cpu_percent),
            memoria_percent: linha.memoria_percent === null ? null : Number(linha.memoria_percent),
            disco_percent: linha.disco_percent === null ? null : Number(linha.disco_percent),
            rede_mbps: linha.rede_mbps === null ? null : Number(linha.rede_mbps),
            latencia_ms: linha.latencia_ms === null ? null : Number(linha.latencia_ms),
            registrado_em: linha.registrado_em,
        })
    ),

    listarAnalises: (req, res) => responderConsulta(
        res,
        () => {
            const filtros = adicionarFiltros(req, {
                componenteColumn: 'a.componente_id',
                data: true,
                dataColumn: 'a.criado_em',
            });

            return {
                sql: `SELECT a.id, a.componente_id, c.nome AS componente_nome,
                             a.tipo, a.resultado, a.recomendacao, a.modelo_ia,
                             a.criado_em, a.severidade
                      FROM analises AS a
                      LEFT JOIN componente_infraestrutura AS c ON c.id = a.componente_id
                      ${filtros.where}
                      ORDER BY a.criado_em DESC`,
                parametros: filtros.parametros,
            };
        },
        (linha) => ({
            id: linha.id,
            componente: linha.componente_id === null
                ? null
                : { id: linha.componente_id, nome: linha.componente_nome },
            tipo: linha.tipo,
            resultado: linha.resultado,
            recomendacao: linha.recomendacao,
            modelo_ia: linha.modelo_ia,
            criado_em: linha.criado_em,
            severidade: linha.severidade,
        })
    ),

    listarPrevisoes: (req, res) => responderConsulta(
        res,
        () => {
            const filtros = adicionarFiltros(req, {
                componenteColumn: 'p.componente_id',
                metrica: 'previsao',
                metricaColumn: 'p.metrica',
                data: true,
                dataColumn: 'p.periodo_previsto',
            });

            return {
                sql: `SELECT p.id, p.componente_id, c.nome AS componente_nome,
                             p.metrica, p.valor_previsto, p.periodo_previsto,
                             p.metodo, p.risco, p.criado_em
                      FROM previsoes AS p
                      INNER JOIN componente_infraestrutura AS c ON c.id = p.componente_id
                      ${filtros.where}
                      ORDER BY p.periodo_previsto`,
                parametros: filtros.parametros,
            };
        },
        (linha) => ({
            id: linha.id,
            componente: { id: linha.componente_id, nome: linha.componente_nome },
            metrica: linha.metrica,
            valor_previsto: linha.valor_previsto === null ? null : Number(linha.valor_previsto),
            periodo_previsto: linha.periodo_previsto,
            metodo: linha.metodo,
            risco: linha.risco,
            criado_em: linha.criado_em,
        })
    ),
};

module.exports = infraestruturaController;
