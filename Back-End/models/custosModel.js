
const executeQuery = require('../database/query');

const custosModel = {

    buscarTarifas: async () => {

        const consulta = await executeQuery(`
            SELECT
                custo_vcpu_hora,
                custo_gb_ram_hora,
                custo_gb_disco_mes
            FROM tarifas_infraestrutura
            ORDER BY atualizado_em DESC, id DESC
            LIMIT 1
        `);

        return consulta[0] || null;
    },

    buscarDadosComponentes: async (dataInicio, dataFim) => {

        return await executeQuery(`
            SELECT
                c.id AS componente_id,
                c.nome AS componente_nome,

                cr.vcpus,
                cr.memoria_total_gb,
                cr.armazenamento_total_gb,

                AVG(m.cpu_percent) AS media_cpu,
                AVG(m.memoria_percent) AS media_ram,
                AVG(m.disco_percent) AS media_disco

            FROM capacidade_recursos AS cr

            INNER JOIN componente_infraestrutura AS c
                ON c.id = cr.componente_id

            LEFT JOIN metricas_infraestrutura AS m
                ON m.componente_id = c.id
                AND m.registrado_em >= ?
                AND m.registrado_em < DATE_ADD(?, INTERVAL 1 DAY)

            GROUP BY
                c.id,
                c.nome,
                cr.vcpus,
                cr.memoria_total_gb,
                cr.armazenamento_total_gb

            ORDER BY c.nome
        `, [dataInicio, dataFim]);

    },

    salvarCusto: async (dados) => {

        return await executeQuery(`
            INSERT INTO custos_infraestrutura (
                componente_id,
                custo_cpu,
                custo_ram,
                custo_disco,
                custo_total,
                periodo_inicio,
                periodo_fim
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            dados.componente_id,
            dados.custo_cpu,
            dados.custo_ram,
            dados.custo_disco,
            dados.custo_total,
            dados.periodo_inicio,
            dados.periodo_fim
        ]);

    },

        listarCustos: async () => {

        return await executeQuery(`
            SELECT
                ci.id,
                ci.componente_id,
                c.nome AS componente,
                ci.custo_cpu,
                ci.custo_ram,
                ci.custo_disco,
                ci.custo_total,
                ci.periodo_inicio,
                ci.periodo_fim,
                ci.calculado_em
            FROM custos_infraestrutura AS ci
            INNER JOIN componente_infraestrutura AS c
                ON c.id = ci.componente_id
            ORDER BY ci.calculado_em DESC, ci.id DESC
        `);

    }

};

module.exports = custosModel;