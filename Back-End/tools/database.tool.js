const executeQuery = require('../database/query');

const SEVERIDADES = ['baixa', 'media', 'alta', 'critica'];
const TABELAS_INFRAESTRUTURA = [
    'analises',
    'componente_infraestrutura',
    'metricas_infraestrutura',
    'previsoes',
    'relacionamento_infraestrutura',
];
const TIPOS_METRICA = {
    cpu: 'cpu_percent',
    memoria: 'memoria_percent',
    disco: 'disco_percent',
    rede: 'rede_mbps',
    latencia: 'latencia_ms',
};

function validarFiltros(filtros = {}) {
    if (!filtros || typeof filtros !== 'object' || Array.isArray(filtros)) {
        throw new Error('Os filtros da ferramenta devem ser um objeto.');
    }

    return filtros;
}

function validarTexto(valor, nomeCampo) {
    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    if (typeof valor !== 'string' || valor.trim().length > 150) {
        throw new Error(`O filtro ${nomeCampo} deve ser um texto de até 150 caracteres.`);
    }

    return valor.trim();
}

function validarOpcao(valor, opcoes, nomeCampo) {
    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    if (typeof valor !== 'string' || !opcoes.includes(valor.toLowerCase())) {
        throw new Error(`O filtro ${nomeCampo} não é válido.`);
    }

    return valor.toLowerCase();
}

const databaseTools = {
    resumo_infraestrutura: {
        definition: {
            type: 'function',
            function: {
                name: 'resumo_infraestrutura',
                description: 'Verifica a disponibilidade das tabelas de infraestrutura cadastradas no banco.',
                parameters: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false,
                },
            },
        },
        async execute() {
            const placeholders = TABELAS_INFRAESTRUTURA.map(() => '?').join(', ');
            return executeQuery(
                `SELECT TABLE_NAME AS tabela, TABLE_ROWS AS registros_estimados
                 FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME IN (${placeholders})
                 ORDER BY TABLE_NAME`,
                TABELAS_INFRAESTRUTURA
            );
        },
    },

    listar_componentes: {
        definition: {
            type: 'function',
            function: {
                name: 'listar_componentes',
                description: 'Lista componentes de infraestrutura, opcionalmente filtrando por nome ou tipo.',
                parameters: {
                    type: 'object',
                    properties: {
                        componente: { type: 'string', description: 'Parte do nome do componente.' },
                        tipo: { type: 'string', description: 'Tipo do componente.' },
                    },
                    additionalProperties: false,
                },
            },
        },
        async execute(argumentos = {}) {
            const filtros = validarFiltros(argumentos);
            const componente = validarTexto(filtros.componente, 'componente');
            const tipo = validarTexto(filtros.tipo, 'tipo');
            const condicoes = [];
            const parametros = [];

            if (componente) {
                condicoes.push('nome LIKE ?');
                parametros.push(`%${componente}%`);
            }
            if (tipo) {
                condicoes.push('tipo = ?');
                parametros.push(tipo);
            }

            return executeQuery(
                `SELECT id, nome, tipo, descricao, status, criado_em
                 FROM componente_infraestrutura
                 ${condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : ''}
                 ORDER BY nome
                 LIMIT 100`,
                parametros
            );
        },
    },

    consultar_metricas: {
        definition: {
            type: 'function',
            function: {
                name: 'consultar_metricas',
                description: 'Consulta métricas registradas de infraestrutura. Pode filtrar por nome do componente e tipo de métrica.',
                parameters: {
                    type: 'object',
                    properties: {
                        componente: { type: 'string', description: 'Parte do nome do componente.' },
                        metrica: {
                            type: 'string',
                            enum: Object.keys(TIPOS_METRICA),
                            description: 'Tipo da métrica: cpu, memoria, disco, rede ou latencia.',
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
        async execute(argumentos = {}) {
            const filtros = validarFiltros(argumentos);
            const componente = validarTexto(filtros.componente, 'componente');
            const metrica = validarOpcao(filtros.metrica, Object.keys(TIPOS_METRICA), 'metrica');
            const condicoes = [];
            const parametros = [];

            if (componente) {
                condicoes.push('c.nome LIKE ?');
                parametros.push(`%${componente}%`);
            }
            if (metrica) {
                condicoes.push(`m.${TIPOS_METRICA[metrica]} IS NOT NULL`);
            }

            return executeQuery(
                `SELECT c.id AS componente_id, c.nome AS componente, m.cpu_percent,
                        m.memoria_percent, m.disco_percent, m.rede_mbps, m.latencia_ms,
                        m.registrado_em
                 FROM metricas_infraestrutura AS m
                 INNER JOIN componente_infraestrutura AS c ON c.id = m.componente_id
                 ${condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : ''}
                 ORDER BY m.registrado_em DESC
                 LIMIT 100`,
                parametros
            );
        },
    },

    consultar_analises: {
        definition: {
            type: 'function',
            function: {
                name: 'consultar_analises',
                description: 'Consulta análises de infraestrutura, com filtros opcionais por severidade e componente.',
                parameters: {
                    type: 'object',
                    properties: {
                        severidade: {
                            type: 'string',
                            enum: SEVERIDADES,
                            description: 'Severidade: baixa, media, alta ou critica.',
                        },
                        componente: { type: 'string', description: 'Parte do nome do componente.' },
                    },
                    additionalProperties: false,
                },
            },
        },
        async execute(argumentos = {}) {
            const filtros = validarFiltros(argumentos);
            const severidade = validarOpcao(filtros.severidade, SEVERIDADES, 'severidade');
            const componente = validarTexto(filtros.componente, 'componente');
            const condicoes = [];
            const parametros = [];

            if (severidade) {
                condicoes.push('a.severidade = ?');
                parametros.push(severidade);
            }
            if (componente) {
                condicoes.push('c.nome LIKE ?');
                parametros.push(`%${componente}%`);
            }

            return executeQuery(
                `SELECT a.id, c.nome AS componente, a.tipo, a.severidade, a.resultado,
                        a.recomendacao, a.modelo_ia, a.criado_em
                 FROM analises AS a
                 LEFT JOIN componente_infraestrutura AS c ON c.id = a.componente_id
                 ${condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : ''}
                 ORDER BY a.criado_em DESC
                 LIMIT 100`,
                parametros
            );
        },
    },

    consultar_previsoes: {
        definition: {
            type: 'function',
            function: {
                name: 'consultar_previsoes',
                description: 'Consulta previsões de métricas e riscos por componente.',
                parameters: {
                    type: 'object',
                    properties: {
                        componente: { type: 'string', description: 'Parte do nome do componente.' },
                        risco: { type: 'string', description: 'Nível de risco informado na previsão.' },
                    },
                    additionalProperties: false,
                },
            },
        },
        async execute(argumentos = {}) {
            const filtros = validarFiltros(argumentos);
            const componente = validarTexto(filtros.componente, 'componente');
            const risco = validarTexto(filtros.risco, 'risco');
            const condicoes = [];
            const parametros = [];

            if (componente) {
                condicoes.push('c.nome LIKE ?');
                parametros.push(`%${componente}%`);
            }
            if (risco) {
                condicoes.push('p.risco = ?');
                parametros.push(risco);
            }

            return executeQuery(
                `SELECT p.id, c.nome AS componente, p.metrica, p.valor_previsto,
                        p.periodo_previsto, p.metodo, p.risco, p.criado_em
                 FROM previsoes AS p
                 INNER JOIN componente_infraestrutura AS c ON c.id = p.componente_id
                 ${condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : ''}
                 ORDER BY p.periodo_previsto
                 LIMIT 100`,
                parametros
            );
        },
    },

    consultar_relacionamentos: {
        definition: {
            type: 'function',
            function: {
                name: 'consultar_relacionamentos',
                description: 'Consulta relacionamentos e dependências entre componentes, opcionalmente filtrados por nome.',
                parameters: {
                    type: 'object',
                    properties: {
                        componente: { type: 'string', description: 'Parte do nome de qualquer componente relacionado.' },
                    },
                    additionalProperties: false,
                },
            },
        },
        async execute(argumentos = {}) {
            const filtros = validarFiltros(argumentos);
            const componente = validarTexto(filtros.componente, 'componente');
            const parametros = [];
            let condicao = '';

            if (componente) {
                condicao = 'WHERE origem.nome LIKE ? OR destino.nome LIKE ?';
                parametros.push(`%${componente}%`, `%${componente}%`);
            }

            return executeQuery(
                `SELECT r.id, origem.nome AS componente_origem,
                        destino.nome AS componente_destino, r.tipo_relacionamento,
                        r.descricao, r.criado_em
                 FROM relacionamento_infraestrutura AS r
                 INNER JOIN componente_infraestrutura AS origem
                    ON origem.id = r.componente_origem_id
                 INNER JOIN componente_infraestrutura AS destino
                    ON destino.id = r.componente_destino_id
                 ${condicao}
                 ORDER BY origem.nome, destino.nome
                 LIMIT 100`,
                parametros
            );
        },
    },
};

module.exports = { databaseTools };
