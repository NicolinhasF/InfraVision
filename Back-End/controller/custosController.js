
const custosModel = require('../models/custosModel');

function arredondar(valor) {
    return Number(valor.toFixed(2));
}

function validarData(data) {
    if (typeof data !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const dataConvertida = new Date(`${data}T00:00:00Z`);

    return !Number.isNaN(dataConvertida.getTime()) &&
        dataConvertida.toISOString().slice(0, 10) === data;
}

const custosController = {

    calcularCustos: async (req, res) => {

        try {

            const { data_inicio, data_fim } = req.body;

            if (!validarData(data_inicio) ||
                !validarData(data_fim)) {

                return res.status(400).json({
                    erro: 'Informe datas válidas no formato AAAA-MM-DD.'
                });
            }

            if (data_inicio > data_fim) {

                return res.status(400).json({
                    erro: 'A data inicial não pode ser posterior à data final.'
                });
            }

            const tarifas = await custosModel.buscarTarifas();

            if (!tarifas) {

                return res.status(409).json({
                    erro: 'Nenhuma tarifa foi cadastrada.'
                });
            }

            const inicio = new Date(`${data_inicio}T00:00:00Z`);
            const fim = new Date(`${data_fim}T00:00:00Z`);

            const dias = Math.floor(
                (fim - inicio) / 86400000
            ) + 1;

            const horas = dias * 24;

            const componentes = await custosModel.buscarDadosComponentes(
                data_inicio,
                data_fim
            );

            if (componentes.length === 0) {

                return res.status(404).json({
                    erro: 'Nenhum componente possui capacidade cadastrada.'
                });
            }

            const resultados = [];
            const ignorados = [];

            for (const componente of componentes) {

                if (
                    componente.media_cpu === null ||
                    componente.media_ram === null ||
                    componente.media_disco === null
                ) {

                    ignorados.push(componente.componente_nome);
                    continue;
                }

                const vcpus = Number(componente.vcpus);
                const memoria = Number(componente.memoria_total_gb);
                const disco = Number(componente.armazenamento_total_gb);

                const cpu = Number(componente.media_cpu);
                const ram = Number(componente.media_ram);
                const armazenamento = Number(componente.media_disco);

                if (
                    ![vcpus, memoria, disco, cpu, ram, armazenamento]
                        .every(Number.isFinite) ||
                    vcpus <= 0 ||
                    memoria <= 0 ||
                    disco <= 0 ||
                    [cpu, ram, armazenamento]
                        .some(valor => valor < 0 || valor > 100)
                ) {

                    ignorados.push(componente.componente_nome);
                    continue;
                }

                const custoCPU =
                    (cpu / 100) *
                    vcpus *
                    horas *
                    Number(tarifas.custo_vcpu_hora);

                const custoRAM =
                    (ram / 100) *
                    memoria *
                    horas *
                    Number(tarifas.custo_gb_ram_hora);

                const custoDisco =
                    (armazenamento / 100) *
                    disco *
                    Number(tarifas.custo_gb_disco_mes) *
                    (dias / 30);

                const custoTotal = custoCPU + custoRAM + custoDisco;

                const dadosCusto = {
                    componente_id: componente.componente_id,
                    custo_cpu: arredondar(custoCPU),
                    custo_ram: arredondar(custoRAM),
                    custo_disco: arredondar(custoDisco),
                    custo_total: arredondar(custoTotal),
                    periodo_inicio: data_inicio,
                    periodo_fim: data_fim
                };

                await custosModel.salvarCusto(dadosCusto);

                resultados.push({
                    componente: componente.componente_nome,
                    ...dadosCusto
                });

            }

            if (resultados.length === 0) {

                return res.status(422).json({
                    erro: 'Não existem métricas válidas para calcular os custos.',
                    componentes_ignorados: ignorados
                });
            }

            return res.status(200).json({

                mensagem: 'Custos calculados e armazenados com sucesso.',

                periodo: {
                    data_inicio,
                    data_fim,
                    dias
                },

                total_geral: arredondar(
                    resultados.reduce(
                        (total, item) => total + item.custo_total,
                        0
                    )
                ),

                total_componentes: resultados.length,

                componentes_ignorados: ignorados,

                dados: resultados

            });

        } catch (error) {

            console.error('Erro ao calcular custos:', error);

            return res.status(500).json({
                erro: 'Não foi possível processar os custos da infraestrutura.'
            });

               }

    },

    listarCustos: async (req, res) => {

        try {

            const custos = await custosModel.listarCustos();

            return res.status(200).json({
                total_registros: custos.length,
                dados: custos
            });

        } catch (error) {

            console.error('Erro ao listar custos:', error);

            return res.status(500).json({
                erro: 'Não foi possível consultar os custos da infraestrutura.'
            });

        }

    }

};

module.exports = custosController;