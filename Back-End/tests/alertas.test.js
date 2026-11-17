const assert = require('node:assert/strict');
const test = require('node:test');

const { gerarAlertas } = require('../controller/alertasController');

const metricas = [
    {
        componente_id: 1,
        componente: 'Servidor de teste',
        cpu_percent: 82.5,
        memoria_percent: 90,
        disco_percent: 50,
    },
];

const configuracao = {
    alerta_cpu: 80,
    alerta_ram: 85,
    alerta_disco: 90,
    alertas_criticos: true,
};

test('gera avisos para as métricas que alcançam o limite configurado', () => {
    const alertas = gerarAlertas(metricas, configuracao);

    assert.deepEqual(alertas.map((item) => item.metrica), ['RAM', 'CPU']);
    assert.equal(alertas[0].severidade, 'alto');
    assert.match(alertas[1].mensagem, /Servidor de teste/);
});

test('desativa uma métrica quando o limite é zero', () => {
    const alertas = gerarAlertas(metricas, {
        ...configuracao,
        alerta_cpu: 0,
    });

    assert.equal(alertas.some((item) => item.metrica === 'CPU'), false);
});

test('oculta alertas críticos se o switch global estiver desligado', () => {
    const alertas = gerarAlertas(
        [{ ...metricas[0], cpu_percent: 96 }],
        { ...configuracao, alertas_criticos: false }
    );

    assert.equal(alertas.some((item) => item.severidade === 'critico'), false);
});
