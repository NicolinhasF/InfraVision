const assert = require('node:assert/strict');
const test = require('node:test');

const {
    validarConfiguracao,
} = require('../controller/configuracoesController');
const BASE = {
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

test('aceita atualização parcial válida e preserva as demais preferências', () => {
    const resultado = validarConfiguracao(BASE, {
        alerta_cpu: false,
        intervalo_minutos: 10,
    });

    assert.equal(resultado.erro, undefined);
    assert.equal(resultado.configuracao.alerta_cpu, false);
    assert.equal(resultado.configuracao.intervalo_minutos, 10);
    assert.equal(resultado.configuracao.alerta_ram, true);
});

test('rejeita ID arbitrário de usuário e entradas inválidas', () => {
    for (const alteracoes of [
        { usuario_id: 999 },
        { intervalo_minutos: 2 },
        { alerta_cpu: 'false' },
        { limite_disco: 101 },
    ]) {
        assert.equal(typeof validarConfiguracao(BASE, alteracoes).erro, 'string');
    }
});

test('rejeita corpo que não seja objeto de configurações', () => {
    assert.equal(typeof validarConfiguracao(BASE, null).erro, 'string');
    assert.equal(typeof validarConfiguracao(BASE, []).erro, 'string');
});
