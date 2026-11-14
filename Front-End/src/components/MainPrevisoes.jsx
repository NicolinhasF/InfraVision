import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import api from "../services/api";

const METRICAS = [
    { campo: "cpu_percent", nome: "CPU", unidade: "%", percentual: true },
    { campo: "memoria_percent", nome: "RAM", unidade: "%", percentual: true },
    { campo: "disco_percent", nome: "Disco", unidade: "%", percentual: true },
    { campo: "rede_mbps", nome: "Rede", unidade: "Mbps", percentual: false },
];

function formatarData(valor, incluirHora = false) {
    if (!valor) return "Data não informada";

    const texto = String(valor).replace("T", " ");
    const [data, hora] = texto.split(" ");
    const partes = data.split("-");
    if (partes.length !== 3) return texto;

    const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
    return incluirHora && hora ? `${dataFormatada} ${hora.slice(0, 5)}` : dataFormatada;
}

function obterTimestamp(valor) {
    if (!valor) return 0;
    return new Date(String(valor).replace(" ", "T")).getTime() || 0;
}

function formatarRespostaIa(texto) {
    return String(texto).split("\n").map((linha, indiceLinha) => (
        <React.Fragment key={indiceLinha}>
            {indiceLinha > 0 && <br />}
            {linha.split(/(\*\*[^*]+\*\*)/g).map((parte, indiceParte) => {
                if (parte.startsWith("**") && parte.endsWith("**")) {
                    return <strong key={indiceParte}>{parte.slice(2, -2)}</strong>;
                }

                return parte;
            })}
        </React.Fragment>
    ));
}

function MainPrevisoes() {
    const [componentes, setComponentes] = useState([]);
    const [metricas, setMetricas] = useState([]);
    const [previsoes, setPrevisoes] = useState([]);
    const [componenteId, setComponenteId] = useState("");
    const [metricaSelecionada, setMetricaSelecionada] = useState("cpu_percent");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [consultandoIa, setConsultandoIa] = useState(false);
    const [respostaIa, setRespostaIa] = useState("");
    const [erroIa, setErroIa] = useState("");

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [respostaComponentes, respostaMetricas] = await Promise.all([
                api.get("/componentes"),
                api.get("/metricas"),
            ]);

            await api.post("/previsoes/gerar");
            const respostaPrevisoes = await api.get("/previsoes");

            const listaComponentes = Array.isArray(respostaComponentes.data?.dados)
                ? respostaComponentes.data.dados
                : [];
            const listaMetricas = Array.isArray(respostaMetricas.data?.dados)
                ? respostaMetricas.data.dados
                : [];
            const listaPrevisoes = Array.isArray(respostaPrevisoes.data?.dados)
                ? respostaPrevisoes.data.dados
                : [];

            const servidores = listaComponentes.filter((item) =>
                String(item.tipo || "").toLowerCase().includes("servidor")
            );

            setComponentes(servidores);
            setMetricas(listaMetricas);
            setPrevisoes(listaPrevisoes);

            const primeiraPrevisao = listaPrevisoes.find((item) =>
                servidores.some((servidor) => servidor.id === item.componente?.id)
            );

            const componenteInicial = primeiraPrevisao?.componente?.id ?? servidores[0]?.id ?? "";
            setComponenteId(componenteInicial === "" ? "" : String(componenteInicial));

            if (primeiraPrevisao?.metrica && METRICAS.some((item) => item.campo === primeiraPrevisao.metrica)) {
                setMetricaSelecionada(primeiraPrevisao.metrica);
            }
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar as informações de previsões. Verifique se o backend está em execução."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const componenteSelecionado = componentes.find((item) => String(item.id) === String(componenteId));
    const metrica = METRICAS.find((item) => item.campo === metricaSelecionada) || METRICAS[0];

    const historico = useMemo(() => metricas
        .filter((item) => String(item.componente?.id) === String(componenteId))
        .filter((item) => item[metricaSelecionada] !== null && item[metricaSelecionada] !== undefined)
        .sort((a, b) => obterTimestamp(a.registrado_em) - obterTimestamp(b.registrado_em)),
    [metricas, componenteId, metricaSelecionada]);

    const previsoesFiltradas = useMemo(() => previsoes
        .filter((item) => String(item.componente?.id) === String(componenteId))
        .filter((item) => item.metrica === metricaSelecionada)
        .sort((a, b) => obterTimestamp(a.periodo_previsto) - obterTimestamp(b.periodo_previsto)),
    [previsoes, componenteId, metricaSelecionada]);

    const graficoDados = useMemo(() => {
        const pontos = [];

        historico.forEach((item) => {
            pontos.push({
                timestamp: obterTimestamp(item.registrado_em),
                periodo: formatarData(item.registrado_em, true),
                historico: Number(item[metricaSelecionada]),
                previsao: null,
            });
        });

        previsoesFiltradas.forEach((item) => {
            pontos.push({
                timestamp: obterTimestamp(item.periodo_previsto),
                periodo: formatarData(item.periodo_previsto, true),
                historico: null,
                previsao: item.valor_previsto === null ? null : Number(item.valor_previsto),
            });
        });

        return pontos.sort((a, b) => a.timestamp - b.timestamp);
    }, [historico, previsoesFiltradas, metricaSelecionada]);

    const previsaoPrincipal = previsoesFiltradas[0];
    const formatarValor = (valor) => {
        if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) return "Sem dado";
        return `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${metrica.unidade}`;
    };

    const classeRisco = (risco) => {
        const normalizado = String(risco || "").toLowerCase();
        if (normalizado.includes("alto") || normalizado.includes("crit")) return "previsoes-risk-high";
        if (normalizado.includes("médio") || normalizado.includes("medio") || normalizado.includes("aten")) return "previsoes-risk-medium";
        if (normalizado.includes("baixo") || normalizado.includes("low")) return "previsoes-risk-low";
        return "";
    };

    const consultarIa = async () => {
        if (!componenteSelecionado) return;

        setConsultandoIa(true);
        setErroIa("");
        setRespostaIa("");

        const ultimoRegistro = historico[historico.length - 1];
        const dadosPrevisao = previsoesFiltradas.map((item) => ({
            valor_previsto: item.valor_previsto,
            periodo_previsto: item.periodo_previsto,
            risco: item.risco,
            metodo: item.metodo,
        }));

        try {
            const resposta = await api.post("/chat", {
                mensagem: `Explique o cenário de ${componenteSelecionado.nome} para a métrica ${metrica.nome}. Última medição disponível: ${ultimoRegistro ? JSON.stringify({ valor: ultimoRegistro[metricaSelecionada], registrado_em: ultimoRegistro.registrado_em }) : "não há medição"}. Previsões registradas: ${JSON.stringify(dadosPrevisao)}. Não invente histórico, tempo de saturação ou percentuais de risco que não estejam nos dados.`,
            });

            setRespostaIa(resposta.data?.resposta || "A IA não retornou uma resposta.");
        } catch (error) {
            setErroIa(error.response?.data?.erro || "Não foi possível consultar a inteligência artificial.");
        } finally {
            setConsultandoIa(false);
        }
    };

    return (
        <div className="previsoes-page">
            <header className="previsoes-page-header">
                <div>
                    <h1>Previsões</h1>
                    <p>O que pode acontecer com base no histórico e tendência</p>
                </div>
                <div className="previsoes-user-area" aria-label="Usuário conectado">
                    <span className="notification-dot" />
                    <div className="user-avatar">AD</div>
                </div>
            </header>

            {carregando ? (
                <div className="previsoes-chart-panel previsoes-state">Carregando componentes, métricas e previsões...</div>
            ) : erro ? (
                <div className="previsoes-chart-panel previsoes-state previsoes-error">
                    {erro}
                    <div><button className="previsoes-ai-button" type="button" onClick={carregarDados}>Tentar novamente</button></div>
                </div>
            ) : (
                <>
                    <div className="previsoes-filters">
                        <select
                            className="previsoes-server-select"
                            aria-label="Selecionar servidor"
                            value={componenteId}
                            onChange={(evento) => {
                                setComponenteId(evento.target.value);
                                setRespostaIa("");
                            }}
                        >
                            {componentes.length ? componentes.map((componente) => (
                                <option key={componente.id} value={componente.id}>{componente.nome}</option>
                            )) : <option value="">Nenhum servidor cadastrado</option>}
                        </select>

                        {METRICAS.map((item) => (
                            <button
                                type="button"
                                key={item.campo}
                                className={`previsoes-metric-button ${metricaSelecionada === item.campo ? "active" : ""}`}
                                onClick={() => {
                                    setMetricaSelecionada(item.campo);
                                    setRespostaIa("");
                                }}
                                aria-pressed={metricaSelecionada === item.campo}
                            >
                                {item.nome}
                            </button>
                        ))}
                    </div>

                    <section className="previsoes-chart-panel">
                        <h2 className="previsoes-chart-heading">{metrica.nome} — Histórico e previsão</h2>
                        <div className="previsoes-chart-labels">
                            <span>Histórico</span>
                            <span>Agora</span>
                            <span>Previsão</span>
                        </div>

                        {graficoDados.length ? (
                            <div className="previsoes-chart-wrap">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={graficoDados} margin={{ top: 22, right: 12, left: 0, bottom: 8 }}>
                                        <CartesianGrid stroke="#e8e7f0" vertical={false} />
                                        <XAxis dataKey="periodo" tick={{ fill: "#85869b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                        <YAxis
                                            domain={metrica.percentual ? [0, 100] : ["auto", "auto"]}
                                            tick={{ fill: "#85869b", fontSize: 9 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={36}
                                        />
                                        <Tooltip formatter={(valor) => formatarValor(valor)} />
                                        <Line
                                            type="monotone"
                                            dataKey="historico"
                                            name="Histórico"
                                            stroke="#7137ff"
                                            strokeWidth={2.5}
                                            dot={{ r: 4, fill: "#7137ff" }}
                                            activeDot={{ r: 6 }}
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="previsao"
                                            name="Previsão"
                                            stroke="#356dff"
                                            strokeWidth={2.5}
                                            dot={{ r: 4, fill: "#356dff" }}
                                            activeDot={{ r: 6 }}
                                            connectNulls={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="previsoes-state">
                                Não existem medições ou previsões cadastradas para este servidor e esta métrica.
                            </div>
                        )}

                        {historico.length === 0 && (
                            <p className="previsoes-chart-note">Não há histórico cadastrado para a métrica selecionada.</p>
                        )}

                    </section>
                    <div className="previsoes-summary-grid">
                        <article className="previsoes-summary-card">
                            <span>Valor previsto</span>
                            <strong>{previsaoPrincipal ? formatarValor(previsaoPrincipal.valor_previsto) : "Sem previsão"}</strong>
                        </article>
                        <article className="previsoes-summary-card">
                            <span>Risco registrado</span>
                            <strong className={classeRisco(previsaoPrincipal?.risco)}>
                                {previsaoPrincipal?.risco || "Não informado"}
                            </strong>
                        </article>
                    </div>

                </>
            )}
        </div>
    );
}

export default MainPrevisoes;
