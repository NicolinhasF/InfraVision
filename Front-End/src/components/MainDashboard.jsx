import React, { useCallback, useEffect, useState } from "react";
import "./paginas/Dashboard/Dashboard.css";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import api from "../services/api";

const formatadorPercentual = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
});
const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
});

function formatarPercentual(valor) {
    return valor === null || valor === undefined
        ? "Sem dados"
        : `${formatadorPercentual.format(valor)}%`;
}

function formatarPeriodo(valor) {
    const data = new Date(String(valor).replace(" ", "T"));
    if (Number.isNaN(data.getTime())) return valor;
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatarTempoAte(valor) {
    if (!valor) return "prazo não informado";

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "prazo não informado";

    const diferencaMs = data.getTime() - Date.now();
    if (diferencaMs <= 0) {
        return `prevista para ${data.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    }

    const horas = Math.ceil(diferencaMs / (60 * 60 * 1000));
    if (horas < 24) {
        return `em aproximadamente ${horas} ${horas === 1 ? "hora" : "horas"}`;
    }

    const dias = Math.ceil(horas / 24);
    return `em aproximadamente ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

function formatarMetrica(metrica) {
    return {
        cpu_percent: "CPU",
        memoria_percent: "RAM",
        disco_percent: "Disco",
    }[metrica] || metrica;
}

function rotuloRisco(risco) {
    if (!risco) return "Não informado";
    return risco.charAt(0).toLocaleUpperCase("pt-BR") + risco.slice(1);
}

function MainDashboard() {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregarDashboard = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const resposta = await api.get("/dashboard");
            setDados(resposta.data);
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar os dados do Dashboard."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDashboard();
    }, [carregarDashboard]);

    const metricas = dados?.metricas;
    const status = dados?.status;
    const previsao = dados?.previsao;
    const historico = dados?.historico || [];
    const alertas = dados?.alertas || [];
    const nomeMetricaPrevisao = previsao ? formatarMetrica(previsao.metrica) : "";
    const temHistorico = historico.some(
        (registro) => registro.cpu !== null || registro.ram !== null
    );

    return (
        <div className="main-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                </div>
                <div className="dashboard-user">
                    <span className="notification-dot"></span>
                    <div className="user-avatar">AD</div>
                </div>
            </div>

            {erro && (
                <div className="dashboard-feedback" role="alert">
                    <span>{erro}</span>
                    <button type="button" onClick={carregarDashboard}>
                        Tentar novamente
                    </button>
                </div>
            )}

            <div className="dashboard-cards">
                <div className="metric-card">
                    <span className="metric-title">SERVIDORES</span>
                    <strong>{carregando ? "..." : metricas?.servidores_total ?? "—"}</strong>
                </div>

                <div className="metric-card">
                    <span className="metric-title">CPU MÉDIA</span>
                    <strong>{carregando ? "..." : formatarPercentual(metricas?.cpu_media)}</strong>
                </div>

                <div className="metric-card">
                    <span className="metric-title">RAM MÉDIA</span>
                    <strong>{carregando ? "..." : formatarPercentual(metricas?.ram_media)}</strong>
                </div>

                <div className="metric-card metric-card-large">
                    <span className="metric-title">CUSTO MENSAL</span>
                    <strong>
                        {carregando
                            ? "..."
                            : metricas?.custo_mensal === null || metricas?.custo_mensal === undefined
                                ? "Sem dados"
                                : formatadorMoeda.format(metricas.custo_mensal)}
                    </strong>
                </div>
            </div>

            <div className="dashboard-grid-main">
                <div className="dashboard-panel chart-panel">
                    <div className="panel-header">
                        <h2>Utilização da infraestrutura</h2>
                        <div className="chart-legends">
                            <span className="cpu-legend">CPU</span>
                            <span className="ram-legend">RAM</span>
                        </div>
                    </div>

                    <div className={`chart-container${!carregando && !temHistorico ? " chart-container-empty" : ""}`}>
                        {carregando ? (
                            <p className="dashboard-empty" role="status">Carregando histórico...</p>
                        ) : !temHistorico ? (
                            <p className="dashboard-empty">Sem histórico de métricas disponível.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historico}>
                                    <CartesianGrid stroke="#ebeaf2" vertical={false} />
                                    <XAxis dataKey="periodo" hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        labelFormatter={formatarPeriodo}
                                        formatter={(valor) => [`${formatadorPercentual.format(valor)}%`]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="cpu"
                                        name="CPU"
                                        stroke="#6c32ff"
                                        strokeWidth={3}
                                        dot={false}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="ram"
                                        name="RAM"
                                        stroke="#3c72ff"
                                        strokeWidth={3}
                                        dot={false}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="dashboard-panel status-panel">
                    <h2>Status</h2>
                    <div className="status-row">
                        <span className="status-badge normal">Normal</span>
                        <strong className="status-value normal-number">
                            {carregando ? "..." : status?.normal ?? 0}
                        </strong>
                    </div>
                    <div className="status-row">
                        <span className="status-badge atencao">Atenção</span>
                        <strong className="status-value attention-number">
                            {carregando ? "..." : status?.atencao ?? 0}
                        </strong>
                    </div>
                    <div className="status-row">
                        <span className="status-badge critico">Crítico</span>
                        <strong className="status-value critical-number">
                            {carregando ? "..." : status?.critico ?? 0}
                        </strong>
                    </div>
                    {!carregando && status?.sem_dados > 0 && (
                        <p className="dashboard-status-note">
                            {status.sem_dados} servidor(es) sem métricas
                        </p>
                    )}
                    <div className="economia">
                        <span>Economia potencial</span>
                        <strong>
                            {carregando
                                ? "..."
                                : dados?.economia_potencial?.valor === null ||
                                    dados?.economia_potencial?.valor === undefined
                                    ? "Sem estimativa"
                                    : `${formatadorMoeda.format(dados.economia_potencial.valor)}/mês`}
                        </strong>
                        {!carregando && dados?.economia_potencial?.valor == null && (
                                <small>
                                    {dados?.economia_potencial?.recomendacoes
                                        ? `${dados.economia_potencial.recomendacoes} recomendação(ões) sem valor financeiro informado.`
                                        : "Nenhuma recomendação com valor financeiro informado."}
                                </small>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-grid-bottom">
                <div className="dashboard-panel">
                    <h2>Alertas recentes</h2>
                    <div className="alerts-list">
                        {carregando ? (
                            <p className="dashboard-empty" role="status">Carregando alertas...</p>
                        ) : alertas.length === 0 ? (
                            <p className="dashboard-empty">Nenhum alerta recente disponível.</p>
                        ) : alertas.map((alerta) => (
                            <div className="alert-row" key={alerta.id}>
                                <strong>{alerta.componente}</strong>
                                <span>{alerta.mensagem}</span>
                                <span className={`status-badge ${alerta.severidade === "critico" ? "critico" : "atencao"}`}>
                                    {alerta.severidade === "critico" ? "Crítico" : "Atenção"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-panel prediction-panel">
                    <h2>Previsão importante</h2>
                    {carregando ? (
                        <p className="dashboard-empty" role="status">Carregando previsão...</p>
                    ) : previsao ? (
                        <>
                            <p className="prediction-message">
                                <strong>{previsao.servidor}</strong>
                                {" — "}
                                previsão de {nomeMetricaPrevisao}
                                {previsao.valor_previsto === null
                                    ? " sem valor informado"
                                    : ` de ${formatarPercentual(previsao.valor_previsto)}`}
                                {" "}
                                {formatarTempoAte(previsao.periodo_previsto)}.
                            </p>
                            <div className="prediction-risk">
                                <span>Risco previsto</span>
                                <strong>{rotuloRisco(previsao.risco)}</strong>
                            </div>
                        </>
                    ) : (
                        <p className="dashboard-empty">Nenhuma previsão relevante disponível.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MainDashboard;
