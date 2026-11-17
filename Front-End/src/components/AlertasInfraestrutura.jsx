import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import "./AlertasInfraestrutura.css";

const CHAVE_NOTIFICACOES = "infravision:notificacoes-alertas";
const DURACAO_AVISO_MS = 8000;
const MAX_NOTIFICACOES = 50;

function carregarNotificacoesSalvas() {
    try {
        const notificacoes = JSON.parse(localStorage.getItem(CHAVE_NOTIFICACOES) || "[]");
        return Array.isArray(notificacoes) ? notificacoes : [];
    } catch (error) {
        console.error("Não foi possível ler as notificações salvas:", error.message);
        return [];
    }
}

function formatarHorario(valor) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "";
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AlertasInfraestrutura() {
    const location = useLocation();
    const [notificacoes, setNotificacoes] = useState(carregarNotificacoesSalvas);
    const [avisos, setAvisos] = useState([]);
    const [intervalo, setIntervalo] = useState(null);
    const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(false);
    const [aberto, setAberto] = useState(false);
    const [erro, setErro] = useState("");
    const notificacoesRef = useRef(notificacoes);
    const idsAlertasAtivos = useRef(new Set());
    const sequenciaAviso = useRef(0);

    const atualizarNotificacoes = useCallback((novasNotificacoes) => {
        const limitadas = novasNotificacoes.slice(0, MAX_NOTIFICACOES);
        notificacoesRef.current = limitadas;
        setNotificacoes(limitadas);

        try {
            localStorage.setItem(CHAVE_NOTIFICACOES, JSON.stringify(limitadas));
        } catch (errorArmazenamento) {
            console.error(
                "Não foi possível salvar as notificações neste navegador:",
                errorArmazenamento.message
            );
        }
    }, []);

    const carregarAlertas = useCallback(async () => {
        try {
            const resposta = await api.get("/alertas");
            const dados = Array.isArray(resposta.data?.dados) ? resposta.data.dados : [];
            const idsAtuais = new Set(dados.map((alerta) => alerta.id));
            const anteriores = idsAlertasAtivos.current;

            const novasNotificacoes = dados
                .filter((alerta) => !anteriores.has(alerta.id))
                .map((alerta) => {
                    sequenciaAviso.current += 1;
                    return {
                        ...alerta,
                        notificacao_id: `${alerta.id}-${Date.now()}-${sequenciaAviso.current}`,
                        criado_em: new Date().toISOString(),
                        expira_em: Date.now() + DURACAO_AVISO_MS,
                        lida: false,
                        ativa: true,
                    };
                });

            idsAlertasAtivos.current = idsAtuais;

            const idsNovas = new Set(novasNotificacoes.map((item) => item.id));
            const historicas = notificacoesRef.current.map((notificacao) => ({
                ...notificacao,
                ativa: idsAtuais.has(notificacao.id),
            }));
            const combinadas = [
                ...novasNotificacoes,
                ...historicas.filter((item) => !idsNovas.has(item.id)),
            ];
            atualizarNotificacoes(combinadas);

            if (novasNotificacoes.length) {
                const idsAviso = new Set(novasNotificacoes.map((item) => item.notificacao_id));
                setAvisos((atuais) => [
                    ...novasNotificacoes,
                    ...atuais.filter((item) => !idsAviso.has(item.notificacao_id)),
                ]);
            }

            setAtualizacaoAutomatica(resposta.data?.atualizacao_automatica === true);
            setIntervalo(Number(resposta.data?.intervalo_minutos));
            setErro("");
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar os alertas dos servidores."
            );
        }
    }, [atualizarNotificacoes]);

    useEffect(() => {
        if (location.pathname === "/") {
            setAvisos([]);
            setErro("");
            setAtualizacaoAutomatica(false);
            setIntervalo(null);
            idsAlertasAtivos.current = new Set();
            atualizarNotificacoes(
                notificacoesRef.current.map((item) => ({ ...item, ativa: false }))
            );
            return undefined;
        }

        carregarAlertas();
        return undefined;
    }, [location.pathname, carregarAlertas, atualizarNotificacoes]);

    useEffect(() => {
        window.addEventListener("infravision:configuracoes-atualizadas", carregarAlertas);
        return () => {
            window.removeEventListener("infravision:configuracoes-atualizadas", carregarAlertas);
        };
    }, [carregarAlertas]);

    useEffect(() => {
        if (!atualizacaoAutomatica || ![1, 5, 10, 15, 30].includes(intervalo)) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") carregarAlertas();
        }, intervalo * 60 * 1000);

        return () => window.clearInterval(timer);
    }, [atualizacaoAutomatica, intervalo, carregarAlertas]);

    useEffect(() => {
        if (!avisos.length) return undefined;

        const timers = avisos.map((aviso) => window.setTimeout(() => {
            setAvisos((atuais) =>
                atuais.filter((item) => item.notificacao_id !== aviso.notificacao_id)
            );
        }, Math.max(0, aviso.expira_em - Date.now())));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [avisos]);

    const marcarLidas = () => {
        atualizarNotificacoes(
            notificacoesRef.current.map((item) => ({ ...item, lida: true }))
        );
    };

    const alternarPainel = () => {
        const novoValor = !aberto;
        if (novoValor) marcarLidas();
        setAberto(novoValor);
    };

    const removerNotificacao = (id) => {
        atualizarNotificacoes(
            notificacoesRef.current.filter((item) => item.notificacao_id !== id)
        );
        setAvisos((atuais) => atuais.filter((item) => item.notificacao_id !== id));
    };

    const limparNotificacoes = () => {
        atualizarNotificacoes([]);
        setAvisos([]);
    };

    if (location.pathname === "/") return null;

    const naoLidas = notificacoes.filter((item) => !item.lida).length;

    return (
        <>
            <div className="alertas-notificacao-area">
                <button
                    className="alertas-sininho"
                    type="button"
                    aria-label={`Notificações${naoLidas ? `, ${naoLidas} não lidas` : ""}`}
                    aria-expanded={aberto}
                    aria-controls="painel-notificacoes-alertas"
                    onClick={alternarPainel}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                    </svg>
                    {naoLidas > 0 && (
                        <span className="alertas-sininho-contador">
                            {naoLidas > 99 ? "99+" : naoLidas}
                        </span>
                    )}
                </button>

                {aberto && (
                    <section
                        className="alertas-painel-notificacoes"
                        id="painel-notificacoes-alertas"
                        aria-label="Notificações dos servidores"
                    >
                        <header>
                            <strong>Notificações</strong>
                            {notificacoes.length > 0 && (
                                <button type="button" onClick={limparNotificacoes}>
                                    Limpar
                                </button>
                            )}
                        </header>

                        {erro && <p className="alertas-notificacao-erro">{erro}</p>}
                        {!erro && notificacoes.length === 0 && (
                            <p className="alertas-notificacoes-vazias">
                                Nenhum alerta registrado.
                            </p>
                        )}
                        <ul>
                            {notificacoes.map((notificacao) => (
                                <li
                                    key={notificacao.notificacao_id}
                                    className={`alerta-notificacao-item ${notificacao.severidade}${notificacao.lida ? " lida" : ""}${notificacao.ativa ? "" : " resolvida"}`}
                                >
                                    <span className="alerta-notificacao-texto">
                                        <strong>{notificacao.ativa ? "Em andamento" : "Registrado"}</strong>
                                        <span>{notificacao.mensagem}</span>
                                        <time dateTime={notificacao.criado_em}>
                                            {formatarHorario(notificacao.criado_em)}
                                        </time>
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="Remover notificação"
                                        onClick={() => removerNotificacao(notificacao.notificacao_id)}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            <div className="alertas-avisos-temporarios" aria-live="polite">
                {avisos.map((aviso) => (
                    <aside
                        className={`alerta-temporario ${aviso.severidade}`}
                        key={aviso.notificacao_id}
                        role="status"
                    >
                        <span className="alerta-temporario-icone" aria-hidden="true">
                            {aviso.severidade === "critico" ? "!" : "↑"}
                        </span>
                        <span>{aviso.mensagem}</span>
                        <button
                            type="button"
                            aria-label="Fechar alerta temporário"
                            onClick={() => setAvisos((atuais) =>
                                atuais.filter((item) => item.notificacao_id !== aviso.notificacao_id)
                            )}
                        >
                            ×
                        </button>
                    </aside>
                ))}
            </div>
        </>
    );
}

export default AlertasInfraestrutura;
