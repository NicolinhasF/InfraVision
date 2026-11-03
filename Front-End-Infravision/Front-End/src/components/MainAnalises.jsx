import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import api from "../services/api";

const CAMPOS_PERCENTUAIS = [
    { campo: "cpu_percent", nome: "CPU" },
    { campo: "memoria_percent", nome: "RAM" },
    { campo: "disco_percent", nome: "Disco" },
];

function formatarData(valor) {
    if (!valor) return "Data não informada";

    const data = String(valor).slice(0, 10);
    const partes = data.split("-");

    if (partes.length !== 3) return String(valor);
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterUltimasMetricas(metricas) {
    const porComponente = new Map();

    metricas.forEach((metrica) => {
        const componenteId = metrica.componente?.id;
        if (componenteId === undefined || componenteId === null) return;

        const atual = porComponente.get(componenteId);
        const dataNova = new Date(metrica.registrado_em || 0).getTime();
        const dataAtual = atual
            ? new Date(atual.registrado_em || 0).getTime()
            : -Infinity;

        if (!atual || dataNova >= dataAtual) {
            porComponente.set(componenteId, metrica);
        }
    });

    return Array.from(porComponente.values());
}

function classificarComponente(metrica) {
    const valores = CAMPOS_PERCENTUAIS
        .map(({ campo }) => metrica[campo])
        .filter((valor) => valor !== null && valor !== undefined && Number.isFinite(Number(valor)))
        .map(Number);

    if (!valores.length) return null;

    const media = valores.reduce((soma, valor) => soma + valor, 0) / valores.length;

    if (media <= 50) return { grupo: "Baixa utilização", classe: "low", media };
    if (media <= 80) return { grupo: "Utilização normal", classe: "normal", media };
    return { grupo: "Alta utilização", classe: "high", media };
}

function MainAnalises() {
    const [metricas, setMetricas] = useState([]);
    const [analises, setAnalises] = useState([]);
    const [abaAtiva, setAbaAtiva] = useState("anomalias");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [consultandoIa, setConsultandoIa] = useState(false);
    const [respostaIa, setRespostaIa] = useState("");
    const [erroIa, setErroIa] = useState("");

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [respostaMetricas, respostaAnalises] = await Promise.all([
                api.get("/metricas"),
                api.get("/analises"),
            ]);

            setMetricas(Array.isArray(respostaMetricas.data?.dados) ? respostaMetricas.data.dados : []);
            setAnalises(Array.isArray(respostaAnalises.data?.dados) ? respostaAnalises.data.dados : []);
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar as informações de análises. Verifique se o backend está em execução."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const metricasAtuais = useMemo(() => obterUltimasMetricas(metricas), [metricas]);

    const anomalias = useMemo(() => metricasAtuais
        .map((metrica) => {
            const recursos = CAMPOS_PERCENTUAIS
                .map(({ campo, nome }) => ({
                    campo,
                    nome,
                    valor: metrica[campo] === null || metrica[campo] === undefined
                        ? null
                        : Number(metrica[campo]),
                }))
                .filter((item) => item.valor !== null && Number.isFinite(item.valor))
                .sort((a, b) => b.valor - a.valor);

            const maiorRecurso = recursos[0];
            if (!maiorRecurso || maiorRecurso.valor < 80) return null;

            return {
                componente: metrica.componente,
                recurso: maiorRecurso.nome,
                valor: maiorRecurso.valor,
                registradoEm: metrica.registrado_em,
                recursos,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.valor - a.valor), [metricasAtuais]);

    const agrupamentos = useMemo(() => {
        const grupos = [
            { id: "low", titulo: "Baixa utilização", etiqueta: "Grupo A", classe: "low", componentes: [] },
            { id: "normal", titulo: "Utilização normal", etiqueta: "Grupo B", classe: "normal", componentes: [] },
            { id: "high", titulo: "Alta utilização", etiqueta: "Grupo C", classe: "high", componentes: [] },
        ];

        metricasAtuais.forEach((metrica) => {
            const classificacao = classificarComponente(metrica);
            if (!classificacao) return;

            const grupo = grupos.find((item) => item.id === classificacao.classe);
            if (grupo) {
                grupo.componentes.push({
                    nome: metrica.componente?.nome || "Componente sem nome",
                    media: classificacao.media,
                });
            }
        });

        return grupos;
    }, [metricasAtuais]);

    const analiseMaisRecente = analises[0];
    const dadosUtilizacao = metricasAtuais.map((metrica) => ({
        componente: metrica.componente?.nome || "Componente",
        cpu: metrica.cpu_percent === null ? null : Number(metrica.cpu_percent),
        ram: metrica.memoria_percent === null ? null : Number(metrica.memoria_percent),
        disco: metrica.disco_percent === null ? null : Number(metrica.disco_percent),
    }));

    const contagemGrupos = agrupamentos.map((grupo) => ({
        nome: grupo.titulo,
        total: grupo.componentes.length,
    }));

    const consultarIa = async () => {
        setConsultandoIa(true);
        setErroIa("");
        setRespostaIa("");

        const contextoMetricas = metricasAtuais.map((item) => ({
            componente: item.componente?.nome,
            cpu_percent: item.cpu_percent,
            memoria_percent: item.memoria_percent,
            disco_percent: item.disco_percent,
            registrado_em: item.registrado_em,
        }));

        const contextoAnalises = analises.map((item) => ({
            componente: item.componente?.nome,
            resultado: item.resultado,
            recomendacao: item.recomendacao,
            severidade: item.severidade,
        }));

        try {
            const resposta = await api.post("/chat", {
                mensagem: `Analise os dados atuais de infraestrutura abaixo. Identifique padrões e riscos, explique as limitações e apresente recomendações sem inventar informações. Métricas: ${JSON.stringify(contextoMetricas)}. Análises registradas: ${JSON.stringify(contextoAnalises)}.`,
            });

            setRespostaIa(resposta.data?.resposta || "A IA não retornou uma resposta.");
        } catch (error) {
            setErroIa(error.response?.data?.erro || "Não foi possível consultar a inteligência artificial.");
        } finally {
            setConsultandoIa(false);
        }
    };

    const renderAnomalias = () => (
        <div className="analises-anomaly-list">
            {anomalias.length ? anomalias.map((anomalia) => (
                <article className="analises-card" key={anomalia.componente?.id}>
                    <div className="analises-card-top">
                        <h2>{anomalia.componente?.nome || "Componente"}</h2>
                        <span className="analises-severity">Alto consumo</span>
                    </div>
                    <p className="analises-card-description">
                        {anomalia.recurso} em {anomalia.valor.toFixed(1)}%, acima do limiar visual de atenção de 80%.
                    </p>
                    <div className="analises-card-bottom">
                        <span>Maior utilização registrada · {formatarData(anomalia.registradoEm)}</span>
                        <strong className="analises-card-value">{anomalia.valor.toFixed(1)}%</strong>
                    </div>
                </article>
            )) : (
                <div className="analises-card analises-state">
                    Nenhuma métrica percentual atingiu o limiar visual de 80% nos últimos registros disponíveis.
                </div>
            )}
        </div>
    );

    const renderPadroes = () => (
        <section className="analises-content-panel">
            <h2>Análises registradas</h2>
            {analises.length ? (
                <div className="analises-history-list">
                    {analises.map((analise) => (
                        <article className="analises-history-item" key={analise.id}>
                            <strong>{analise.componente?.nome || "Análise geral"} · {analise.tipo || "Análise"}</strong>
                            <p>{analise.resultado || "Resultado não informado."}</p>
                            {analise.recomendacao && <p><b>Recomendação:</b> {analise.recomendacao}</p>}
                            <p>{formatarData(analise.criado_em)}{analise.severidade ? ` · Severidade: ${analise.severidade}` : ""}</p>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="analises-state">Ainda não existem análises cadastradas.</p>
            )}
        </section>
    );

    const renderUtilizacao = () => (
        <section className="analises-content-panel">
            <h2>Utilização dos recursos por componente</h2>
            <div className="analises-chart-legend">
                <span><i className="analises-legend-dot" style={{ background: "#7137ff" }} />CPU</span>
                <span><i className="analises-legend-dot" style={{ background: "#3972ff" }} />RAM</span>
                <span><i className="analises-legend-dot" style={{ background: "#20ad75" }} />Disco</span>
            </div>
            {dadosUtilizacao.length ? (
                <div className="analises-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosUtilizacao} margin={{ top: 8, right: 12, left: -18, bottom: 42 }}>
                            <CartesianGrid stroke="#eeedf4" vertical={false} />
                            <XAxis
                                dataKey="componente"
                                tick={{ fill: "#777990", fontSize: 9 }}
                                angle={-18}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis domain={[0, 100]} tick={{ fill: "#777990", fontSize: 9 }} />
                            <Tooltip formatter={(valor) => valor === null ? "Sem dado" : `${valor}%`} />
                            <Bar dataKey="cpu" name="CPU" fill="#7137ff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ram" name="RAM" fill="#3972ff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="disco" name="Disco" fill="#20ad75" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="analises-state">Não há métricas disponíveis para montar o gráfico.</p>
            )}
        </section>
    );

    const renderAgrupamentos = () => (
        <GroupsPanel grupos={agrupamentos} />
    );

    const tabs = [
        { id: "anomalias", nome: "Anomalias" },
        { id: "padroes", nome: "Padrões" },
        { id: "utilizacao", nome: "Utilização" },
        { id: "agrupamentos", nome: "Agrupamentos" },
    ];

    return (
        <div className="analises-page">
            <header className="analises-page-header">
                <div>
                    <h1>Análises</h1>
                    <p>Mineração de dados aplicada ao comportamento da infraestrutura</p>
                </div>
                <div className="analises-user-area" aria-label="Usuário conectado">
                    <span className="notification-dot" />
                    <div className="user-avatar">AD</div>
                </div>
            </header>

            <nav className="analises-tabs" aria-label="Categorias de análise">
                {tabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.id}
                        className={`analises-tab ${abaAtiva === tab.id ? "active" : ""}`}
                        onClick={() => setAbaAtiva(tab.id)}
                        aria-pressed={abaAtiva === tab.id}
                    >
                        {tab.nome}
                    </button>
                ))}
            </nav>

            {carregando ? (
                <div className="analises-content-panel analises-state">Carregando métricas e análises...</div>
            ) : erro ? (
                <div className="analises-content-panel analises-state analises-error">
                    {erro}
                    <div><button className="analises-retry" type="button" onClick={carregarDados}>Tentar novamente</button></div>
                </div>
            ) : (
                <>
                    {abaAtiva === "anomalias" && (
                        <div className="analises-overview">
                            {renderAnomalias()}
                            <PatternPanel
                                analise={analiseMaisRecente}
                                contagens={contagemGrupos}
                                onConsultarIa={consultarIa}
                                consultandoIa={consultandoIa}
                                respostaIa={respostaIa}
                                erroIa={erroIa}
                            />
                        </div>
                    )}

                    {abaAtiva === "padroes" && (
                        <div className="analises-overview">
                            {renderPadroes()}
                            <PatternPanel
                                analise={analiseMaisRecente}
                                contagens={contagemGrupos}
                                onConsultarIa={consultarIa}
                                consultandoIa={consultandoIa}
                                respostaIa={respostaIa}
                                erroIa={erroIa}
                            />
                        </div>
                    )}

                    {abaAtiva === "utilizacao" && (
                        <div className="analises-overview">
                            {renderUtilizacao()}
                            <section className="analises-pattern-card">
                                <h2>Resumo da utilização</h2>
                                <p className="analises-pattern-quote">
                                    {metricasAtuais.length} componentes com métricas recentes.
                                </p>
                                <p className="analises-pattern-recommendation">
                                    O gráfico apresenta CPU, RAM e disco somente quando o respectivo valor existe no banco.
                                </p>
                            </section>
                        </div>
                    )}

                    {abaAtiva === "agrupamentos" && (
                        <GroupsPanel grupos={agrupamentos} />
                    )}

                    {abaAtiva !== "agrupamentos" && (
                        <GroupsPanel grupos={agrupamentos} />
                    )}

                    <p className="analises-note">
                        Os agrupamentos são calculados pela média das métricas percentuais disponíveis (CPU, RAM e disco). O destaque de anomalia usa um limiar visual de 80%; esses critérios são regras da interface, não percentuais de anomalia fornecidos pelo banco ou pela Groq.
                    </p>
                </>
            )}
        </div>
    );
}

function PatternPanel({ analise, contagens, onConsultarIa, consultandoIa, respostaIa, erroIa }) {
    return (
        <section className="analises-pattern-card">
            <h2>Padrão identificado</h2>
            {analise ? (
                <>
                    <p className="analises-pattern-quote">{analise.resultado || "Análise registrada sem descrição."}</p>
                    {analise.recomendacao && (
                        <p className="analises-pattern-recommendation">
                            <b>Recomendação:</b> {analise.recomendacao}
                        </p>
                    )}
                </>
            ) : (
                <p className="analises-pattern-quote">Ainda não há análises cadastradas.</p>
            )}

            <span className="analises-classification-title">Classificações por utilização média</span>
            <div className="analises-classifications">
                {contagens.map((item) => (
                    <React.Fragment key={item.nome}>
                        <span>{item.nome}</span>
                        <strong>{item.total}</strong>
                    </React.Fragment>
                ))}
            </div>

            <button className="analises-ai-button" type="button" onClick={onConsultarIa} disabled={consultandoIa}>
                {consultandoIa ? "Consultando IA..." : "Interpretar dados com IA"}
            </button>
            {erroIa && <div className="analises-ai-result analises-error">{erroIa}</div>}
            {respostaIa && <div className="analises-ai-result">{respostaIa}</div>}
        </section>
    );
}

function GroupsPanel({ grupos }) {
    return (
        <section className="analises-groups-panel">
            <h2>Agrupamentos</h2>
            <div className="analises-groups-grid">
                {grupos.map((grupo) => (
                    <article className="analises-group-card" key={grupo.id}>
                        <span className={`analises-group-label ${grupo.classe}`}>{grupo.etiqueta}</span>
                        <h3>{grupo.titulo}</h3>
                        <p className="analises-group-count">{grupo.componentes.length} componente(s)</p>
                        <p>{grupo.componentes.length
                            ? grupo.componentes.map((item) => item.nome).join(", ")
                            : "Nenhum componente nesta classificação."}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default MainAnalises;
