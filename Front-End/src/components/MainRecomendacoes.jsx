import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import useAtualizacaoAutomatica from "../hooks/useAtualizacaoAutomatica";

function prioridadeNormalizada(valor) {
    const prioridade = String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (["critica", "alta"].includes(prioridade)) return "alta";
    if (prioridade === "media") return "media";
    return "baixa";
}

function MainRecomendacoes() {
    const [recomendacoes, setRecomendacoes] = useState([]);
    const [justificativa, setJustificativa] = useState(
        "As recomendações são baseadas nas métricas e análises registradas no banco de dados."
    );
    const [carregando, setCarregando] = useState(true);
    const [gerando, setGerando] = useState(false);
    const [erro, setErro] = useState("");
    const requisicaoAtiva = useRef(false);

    const carregarRecomendacoes = useCallback(async (silencioso = false) => {
        if (requisicaoAtiva.current) return;
        requisicaoAtiva.current = true;

        if (!silencioso) {
            setCarregando(true);
            setErro("");
        }

        try {
            const resposta = await api.get("/recomendacoes");
            setRecomendacoes(
                Array.isArray(resposta.data?.dados) ? resposta.data.dados : []
            );
            if (resposta.data?.justificativa) {
                setJustificativa(resposta.data.justificativa);
            }
            if (silencioso) setErro("");
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar as recomendações."
            );
        } finally {
            requisicaoAtiva.current = false;
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarRecomendacoes();
    }, [carregarRecomendacoes]);

    useAtualizacaoAutomatica(() => carregarRecomendacoes(true));

    const gerarRecomendacoes = async () => {
        setGerando(true);
        setErro("");

        try {
            const resposta = await api.post(
                "/recomendacoes/gerar",
                {},
                { timeout: 60000 }
            );
            setRecomendacoes(
                Array.isArray(resposta.data?.dados) ? resposta.data.dados : []
            );
            if (resposta.data?.justificativa) {
                setJustificativa(resposta.data.justificativa);
            }
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível gerar recomendações."
            );
        } finally {
            setGerando(false);
        }
    };

    return (
        <section className="recomendacoes-page">
            <header className="recomendacoes-header">
                <div>
                    <h1>Recomendações</h1>
                    <p>
                        Resultados estruturados interpretados pela IA para apoiar a decisão
                    </p>
                </div>
                <div className="recomendacoes-user-area">
                    <span className="notification-dot" aria-hidden="true"></span>
                    <div className="user-avatar" aria-label="Usuário">AD</div>
                </div>
            </header>

            <div className="recomendacoes-actions">
                <button
                    type="button"
                    onClick={gerarRecomendacoes}
                    disabled={gerando || carregando}
                    className="recomendacoes-generate-button"
                >
                    {gerando ? "Gerando..." : "Gerar recomendações com IA"}
                </button>
                <button
                    type="button"
                    onClick={() => carregarRecomendacoes()}
                    disabled={carregando}
                    className="recomendacoes-refresh-button"
                >
                    Atualizar
                </button>
            </div>

            {erro && (
                <div className="recomendacoes-error" role="alert">
                    {erro}
                </div>
            )}

            {carregando ? (
                <div className="recomendacoes-state" role="status">
                    Carregando recomendações...
                </div>
            ) : recomendacoes.length === 0 ? (
                <div className="recomendacoes-empty">
                    <h2>Nenhuma recomendação encontrada</h2>
                    <p>Gere recomendações para analisar as métricas disponíveis.</p>
                </div>
            ) : (
                <div className="recomendacoes-grid">
                    {recomendacoes.map((item) => {
                        const prioridade = prioridadeNormalizada(item.severidade);

                        return (
                            <article className="recomendacao-card" key={item.id}>
                                <span className={`recomendacao-priority ${prioridade}`}>
                                    PRIORIDADE {prioridade.toUpperCase()}
                                </span>
                                <h2>{item.resultado}</h2>
                                <div className="recomendacao-section">
                                    <span>Sugestão</span>
                                    <p>{item.recomendacao}</p>
                                </div>
                                {item.beneficio && (
                                    <div className="recomendacao-section">
                                        <span>Benefício estimado</span>
                                        <strong className="recomendacao-benefit">
                                            {item.beneficio}
                                        </strong>
                                    </div>
                                )}
                                {item.impacto && (
                                    <div className="recomendacao-section">
                                        <span>Impacto esperado</span>
                                        <p>{item.impacto}</p>
                                    </div>
                                )}
                                <small className="recomendacao-component">
                                    {item.componente || "Componente não identificado"}
                                </small>
                            </article>
                        );
                    })}
                </div>
            )}

            <section className="recomendacoes-explanation">
                <h2>Por que essa recomendação?</h2>
                <p>{justificativa}</p>
                <small>
                    Os dados de demonstração devem ser interpretados como exemplos,
                    não como medições confirmadas de servidores reais.
                </small>
            </section>
        </section>
    );
}

export default MainRecomendacoes;
