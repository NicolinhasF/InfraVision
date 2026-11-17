const executeQuery = require('../database/query');

const CONFIGURACOES_PADRAO = {
    atualizacao_automatica: true,
    intervalo_minutos: 5,
    alertas_criticos: true,
    alertas_economia: false,
    alerta_cpu: true,
    limite_cpu: 80,
    alerta_ram: true,
    limite_ram: 85,
    alerta_disco: true,
    limite_disco: 90,
};

function normalizarConfiguracao(linha) {
    const limiteCpu = Number(linha.alerta_cpu);
    const limiteRam = Number(linha.alerta_ram);
    const limiteDisco = Number(linha.alerta_disco);

    return {
        atualizacao_automatica: Boolean(linha.atualizacao_automatica),
        intervalo_minutos: Number(linha.intervalo_atualizacao),
        alertas_criticos: Boolean(linha.alertas_criticos),
        alertas_economia: Boolean(linha.alertas_economia),
        alerta_cpu: limiteCpu > 0,
        limite_cpu: limiteCpu > 0 ? limiteCpu : CONFIGURACOES_PADRAO.limite_cpu,
        alerta_ram: limiteRam > 0,
        limite_ram: limiteRam > 0 ? limiteRam : CONFIGURACOES_PADRAO.limite_ram,
        alerta_disco: limiteDisco > 0,
        limite_disco: limiteDisco > 0 ? limiteDisco : CONFIGURACOES_PADRAO.limite_disco,
    };
}

async function garantirRegistro() {
    await executeQuery(
        `INSERT INTO configuracoes_sistema (id)
         VALUES (1)
         ON DUPLICATE KEY UPDATE id = id`
    );
}

async function buscar() {
    await garantirRegistro();
    const linhas = await executeQuery(
        `SELECT atualizacao_automatica, intervalo_atualizacao, alertas_criticos,
                alertas_economia, alerta_cpu, alerta_ram, alerta_disco
         FROM configuracoes_sistema
         WHERE id = 1`
    );

    return linhas[0] ? normalizarConfiguracao(linhas[0]) : { ...CONFIGURACOES_PADRAO };
}

async function atualizar(configuracao) {
    const atual = await buscar();
    const limiteCpu = configuracao.alerta_cpu
        ? configuracao.limite_cpu || atual.limite_cpu
        : 0;
    const limiteRam = configuracao.alerta_ram
        ? configuracao.limite_ram || atual.limite_ram
        : 0;
    const limiteDisco = configuracao.alerta_disco
        ? configuracao.limite_disco || atual.limite_disco
        : 0;

    await executeQuery(
        `INSERT INTO configuracoes_sistema
            (id, atualizacao_automatica, intervalo_atualizacao,
             alertas_criticos, alertas_economia, alerta_cpu, alerta_ram, alerta_disco)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            atualizacao_automatica = VALUES(atualizacao_automatica),
            intervalo_atualizacao = VALUES(intervalo_atualizacao),
            alertas_criticos = VALUES(alertas_criticos),
            alertas_economia = VALUES(alertas_economia),
            alerta_cpu = VALUES(alerta_cpu),
            alerta_ram = VALUES(alerta_ram),
            alerta_disco = VALUES(alerta_disco)`,
        [
            configuracao.atualizacao_automatica,
            configuracao.intervalo_minutos,
            configuracao.alertas_criticos,
            configuracao.alertas_economia,
            limiteCpu,
            limiteRam,
            limiteDisco,
        ]
    );

    return buscar();
}

module.exports = { CONFIGURACOES_PADRAO, buscar, atualizar };
