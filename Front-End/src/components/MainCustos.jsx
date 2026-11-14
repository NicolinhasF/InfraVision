
import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(valor) {
    if (!valor) return "Não informado";

    const data = String(valor).slice(0, 10);
    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function MainCustos() {
    const [custos, setCustos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregarCustos = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const resposta = await api.get("/custos");

            const dados = Array.isArray(resposta.data?.dados)
                ? resposta.data.dados
                : [];

            setCustos(dados);
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar os custos. Verifique se o backend está em execução."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarCustos();
    }, [carregarCustos]);

    const custoTotal = custos.reduce(
        (total, item) => total + Number(item.custo_total || 0),
        0
    );

    const custoMedio = custos.length
        ? custoTotal / custos.length
        : 0;

    return (
        <div className="custos-page">

            <header className="custos-page-header">
                <div>
                    <h1>Custos de Infraestrutura</h1>
                    <p>Acompanhamento dos custos de utilização dos componentes</p>
                </div>

                <div className="custos-user-area">
                    <span className="notification-dot" />
                    <div className="user-avatar">AD</div>
                </div>
            </header>

            {carregando ? (
                <div className="custos-state">
                    Carregando informações de custos...
                </div>
            ) : erro ? (
                <div className="custos-state custos-error">
                    {erro}

                    <div>
                        <button
                            className="custos-retry"
                            onClick={carregarCustos}
                            type="button"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <section className="custos-summary-grid">

                        <article className="custos-summary-card">
                            <span>Custo total registrado</span>
                            <strong>{formatarMoeda(custoTotal)}</strong>
                        </article>

                        <article className="custos-summary-card">
                            <span>Registros de custos</span>
                            <strong>{custos.length}</strong>
                        </article>

                        <article className="custos-summary-card">
                            <span>Custo médio por registro</span>
                            <strong>{formatarMoeda(custoMedio)}</strong>
                        </article>

                    </section>

                    <section className="custos-content-panel">

                        <div className="custos-panel-header">
                            <div>
                                <h2>Histórico de custos</h2>
                                <p>Custos calculados e armazenados no sistema</p>
                            </div>

                            <button
                                className="custos-refresh"
                                type="button"
                                onClick={carregarCustos}
                            >
                                Atualizar
                            </button>
                        </div>

                        {custos.length === 0 ? (
                            <div className="custos-state">
                                Nenhum registro de custo encontrado.
                            </div>
                        ) : (
                            <div className="custos-table-container">
                                <table className="custos-table">
                                    <thead>
                                        <tr>
                                            <th>Componente</th>
                                            <th>CPU</th>
                                            <th>RAM</th>
                                            <th>Disco</th>
                                            <th>Período</th>
                                            <th>Custo total</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {custos.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>
                                                        {typeof item.componente === "object"
                                                            ? item.componente?.nome || "Componente"
                                                            : item.componente || `Componente ${item.componente_id}`}
                                                    </strong>
                                                </td>

                                                <td>{formatarMoeda(item.custo_cpu)}</td>
                                                <td>{formatarMoeda(item.custo_ram)}</td>
                                                <td>{formatarMoeda(item.custo_disco)}</td>

                                                <td>
                                                    {formatarData(item.periodo_inicio)}
                                                    {" até "}
                                                    {formatarData(item.periodo_fim)}
                                                </td>

                                                <td className="custos-total-cell">
                                                    {formatarMoeda(item.custo_total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </section>
                </>
            )}

        </div>
    );
}

export default MainCustos;
