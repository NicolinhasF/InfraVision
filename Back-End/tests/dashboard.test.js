const assert = require('node:assert/strict');
const test = require('node:test');

const {
    dashboardController,
    classificarStatus,
    media,
} = require('../controller/dashboardController');
const db = require('../config/db');

test('classifica servidores com os limites configurados e o corte crítico do projeto', () => {
    const status = classificarStatus([
        { cpu_percent: 40, memoria_percent: 50, disco_percent: 60 },
        { cpu_percent: 85, memoria_percent: 50, disco_percent: 60 },
        { cpu_percent: 95, memoria_percent: 50, disco_percent: 60 },
        { cpu_percent: null, memoria_percent: null, disco_percent: null },
    ], {
        alerta_cpu: 80,
        alerta_ram: 85,
        alerta_disco: 90,
    });

    assert.deepEqual(status, {
        normal: 1,
        atencao: 1,
        critico: 1,
        sem_dados: 1,
    });
});

test('usa os limites padrão para classificar status quando alertas da métrica estão desligados', () => {
    const status = classificarStatus([
        { cpu_percent: 81, memoria_percent: null, disco_percent: null },
    ], {
        alerta_cpu: 0,
        alerta_ram: 0,
        alerta_disco: 0,
    });

    assert.equal(status.atencao, 1);
});

test('calcula média ignorando valores ausentes e retorna null sem valores válidos', () => {
    assert.equal(media([20, null, '40']), 30);
    assert.equal(media([null, undefined]), null);
});

test('não conta servidores sem métricas como normais', () => {
    assert.deepEqual(classificarStatus([], {}), {
        normal: 0,
        atencao: 0,
        critico: 0,
        sem_dados: 0,
    });
});

test('endpoint retorna indicadores vazios sem inventar valores quando não há registros', async () => {
    const consultaOriginal = db.query;
    db.query = async () => [[], []];

    const resposta = {
        statusCode: null,
        body: null,
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };

    try {
        await dashboardController.buscar({}, resposta);
        assert.equal(resposta.statusCode, 200);
        assert.equal(resposta.body.metricas.servidores_total, 0);
        assert.equal(resposta.body.metricas.cpu_media, null);
        assert.equal(resposta.body.metricas.ram_media, null);
        assert.equal(resposta.body.metricas.custo_mensal, null);
        assert.deepEqual(resposta.body.historico, []);
        assert.deepEqual(resposta.body.alertas, []);
        assert.equal(resposta.body.previsao, null);
        assert.equal(resposta.body.economia_potencial.valor, null);
    } finally {
        db.query = consultaOriginal;
    }
});
