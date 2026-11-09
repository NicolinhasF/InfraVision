import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import api from "../services/api";
import { obterStatusOperacional } from "../utils/servidores";

import "./paginas/Dashboard/Dashboard.css";
import "./paginas/DetalhesServidor/DetalhesServidor.css";

function numeroOuNulo(valor) {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function formatarPercentual(valor) {
    return valor === null ? "—" : `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function formatarData(valor) {
    if (!valor) return "Data não informada";
    const data = new Date(String(valor).replace(" ", "T"));
    if (Number.isNaN(data.getTime())) return String(valor);
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function MainDetalhesServidor() {
    const { id } = useParams();
    const [servidor, setServidor] = useState(null);
    const [metricas, setMetricas] = useState([]);
    const [analises, setAnalises] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarDetalhes() {
            try {
                setCarregando(true);
                setErro("");

                const [componentesResposta, metricasResposta, analisesResposta] = await Promise.all([
                    api.get("/componentes"),
                    api.get("/metricas", { params: { componente_id: id } }),
                    api.get("/analises", { params: { componente_id: id } }),
                ]);

                const componentes = componentesResposta.data?.dados || [];
                const componenteEncontrado = componentes.find(
                    (item) => Number(item.id) === Number(id) && String(item.tipo).toLowerCase() === "servidor"
                );

                if (ativo) {
                    setServidor(componenteEncontrado || null);
                    setMetricas(metricasResposta.data?.dados || []);
                    setAnalises(analisesResposta.data?.dados || []);
                }
            } catch (error) {
                if (ativo) {
                    setErro(
                        error.response?.data?.erro ||
                        "Não foi possível carregar os detalhes. Confira a conexão com o backend."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarDetalhes();

        return () => {
            ativo = false;
        };
    }, [id]);

    // A API entrega as medições mais recentes primeiro. O gráfico precisa da ordem cronológica.
    const historico = useMemo(() => [...metricas].reverse(), [metricas]);

    const historicoCpu = useMemo(() => historico
        .map((item) => ({
            periodo: formatarData(item.registrado_em),
            valor: numeroOuNulo(item.cpu_percent),
        }))
        .filter((item) => item.valor !== null), [historico]);

    const historicoRam = useMemo(() => historico
        .map((item) => ({
            periodo: formatarData(item.registrado_em),
            valor: numeroOuNulo(item.memoria_percent),
        }))
        .filter((item) => item.valor !== null), [historico]);

    const ultimaMetrica = metricas[0] || {};
    const cpu = numeroOuNulo(ultimaMetrica.cpu_percent);
    const ram = numeroOuNulo(ultimaMetrica.memoria_percent);
    const disco = numeroOuNulo(ultimaMetrica.disco_percent);
    const rede = numeroOuNulo(ultimaMetrica.rede_mbps);

    const dadosDisco = disco === null ? [] : [
        { nome: "Usado", valor: Math.max(0, Math.min(100, disco)) },
        { nome: "Livre", valor: 100 - Math.max(0, Math.min(100, disco)) },
    ];

    const topo = (titulo) => (
        <div className="dashboard-header">
            <div>
                <h1>{titulo}</h1>
                <Link to="/servidores" className="link-voltar">← Voltar</Link>
            </div>
            <div className="dashboard-user">
                <span className="notification-dot"></span>
                <div className="user-avatar">AD</div>
            </div>
        </div>
    );

    if (carregando) {
        return (
            <div className="main-dashboard">
                {topo("Detalhes do servidor")}
                <div className="dashboard-panel"><p className="eventos-vazio">Carregando informações do servidor...</p></div>
            </div>
        );
    }

    if (erro || !servidor) {
        return (
            <div className="main-dashboard">
                {topo("Servidor não encontrado")}
                <div className="dashboard-panel">
                    <p className="eventos-vazio">
                        {erro || `Não existe um servidor com o ID ${id}. Volte para a lista e escolha um servidor cadastrado.`}
                    </p>
                </div>
            </div>
        );
    }

    const metricCards = [
        { titulo: "CPU", valor: formatarPercentual(cpu) },
        { titulo: "RAM", valor: formatarPercentual(ram) },
        { titulo: "DISCO", valor: formatarPercentual(disco) },
        { titulo: "REDE", valor: rede === null ? "—" : `${rede.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} Mbps` },
    ];

    return (
        <div className="main-dashboard">
            {topo(servidor.nome)}

            <div className="detalhes-identificacao">
                <span><strong>IP:</strong> {servidor.ip || "Não cadastrado"}</span>
                <span><strong>Status:</strong> {obterStatusOperacional({ ...servidor, cpu_percent: cpu, memoria_percent: ram, disco_percent: disco })}</span>
            </div>

            <div className="detalhes-cards">
                {metricCards.map((metrica) => (
                    <div className="metric-card" key={metrica.titulo}>
                        <span className="metric-title">{metrica.titulo}</span>
                        <strong>{metrica.valor}</strong>
                    </div>
                ))}
            </div>

            <div className="detalhes-graficos">
                <div className="dashboard-panel">
                    <h2>CPU — histórico registrado</h2>
                    {historicoCpu.length === 0 ? (
                        <p className="eventos-vazio">Ainda não existem medições de CPU para este servidor.</p>
                    ) : (
                        <>
                            <div className="grafico-detalhe">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historicoCpu}>
                                        <CartesianGrid stroke="#ebeaf2" vertical={false} />
                                        <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip formatter={(valor) => `${valor}%`} />
                                        <Line type="monotone" name="CPU" dataKey="valor" stroke="#ef3b45" strokeWidth={3} dot />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            {historicoCpu.length < 2 && <p className="aviso-historico">Existe apenas uma medição. O histórico será formado conforme novas coletas forem registradas.</p>}
                        </>
                    )}
                </div>

                <div className="dashboard-panel">
                    <h2>RAM — histórico registrado</h2>
                    {historicoRam.length === 0 ? (
                        <p className="eventos-vazio">Ainda não existem medições de RAM para este servidor.</p>
                    ) : (
                        <>
                            <div className="grafico-detalhe">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historicoRam}>
                                        <CartesianGrid stroke="#ebeaf2" vertical={false} />
                                        <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip formatter={(valor) => `${valor}%`} />
                                        <Line type="monotone" name="RAM" dataKey="valor" stroke="#6c32ff" strokeWidth={3} dot />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            {historicoRam.length < 2 && <p className="aviso-historico">Existe apenas uma medição. O histórico será formado conforme novas coletas forem registradas.</p>}
                        </>
                    )}
                </div>
            </div>

            <div className="detalhes-inferior">
                <div className="dashboard-panel">
                    <h2>Disco</h2>
                    {disco === null ? (
                        <p className="eventos-vazio">Não existe medição de disco para este servidor.</p>
                    ) : (
                        <div className="disco-grafico">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={dadosDisco} dataKey="valor" nameKey="nome" innerRadius="72%" outerRadius="95%" startAngle={90} endAngle={-270} stroke="none">
                                        <Cell fill="#6c32ff" />
                                        <Cell fill="#ebe5ff" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <span className="disco-valor">{formatarPercentual(disco)}</span>
                        </div>
                    )}
                </div>

                <div className="dashboard-panel">
                    <h2>Análises registradas</h2>
                    {analises.length === 0 ? (
                        <p className="eventos-vazio">Nenhuma análise foi registrada para este servidor.</p>
                    ) : (
                        <ul className="eventos-lista">
                            {analises.map((analise) => (
                                <li key={analise.id}>
                                    <span className="evento-hora">{formatarData(analise.criado_em)}</span>
                                    <span className="evento-descricao">
                                        <strong>{analise.tipo || "Análise"}:</strong> {analise.resultado || "Sem descrição"}
                                        {analise.recomendacao && <span className="detalhe-recomendacao">Recomendação: {analise.recomendacao}</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MainDetalhesServidor;
