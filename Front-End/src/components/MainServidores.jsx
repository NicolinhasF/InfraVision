import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { obterStatusOperacional } from "../utils/servidores";

import "./paginas/Dashboard/Dashboard.css";
import "./paginas/Servidores/Servidores.css";

function classeUso(valor) {
    if (valor === null || valor === undefined || valor === "") return "uso-sem-dado";
    const numero = Number(valor);
    if (numero >= 85) return "uso-alto";
    if (numero >= 60) return "uso-medio";
    return "uso-baixo";
}

function formatarPercentual(valor) {
    if (valor === null || valor === undefined || valor === "") return "—";
    return `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function classeStatus(status) {
    if (status === "Crítico") return "critico";
    if (status === "Atenção") return "atencao";
    if (status === "Normal") return "normal";
    return "desconhecido";
}

function MainServidores() {
    const [servidores, setServidores] = useState([]);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("Todos");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarServidores() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await api.get("/servidores");
                const dados = Array.isArray(resposta.data?.dados)
                    ? resposta.data.dados
                    : [];

                if (ativo) setServidores(dados);
            } catch (error) {
                if (ativo) {
                    setErro(
                        error.response?.data?.erro ||
                        "Não foi possível carregar os servidores. Confira se o backend está em execução."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarServidores();

        return () => {
            ativo = false;
        };
    }, []);

    const servidoresFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return servidores.filter((servidor) => {
            const nome = String(servidor.nome || "").toLowerCase();
            const ip = String(servidor.ip || "").toLowerCase();
            const status = obterStatusOperacional(servidor);

            const combinaBusca = nome.includes(termo) || ip.includes(termo);
            const combinaStatus = filtroStatus === "Todos" || status === filtroStatus;

            return combinaBusca && combinaStatus;
        });
    }, [servidores, busca, filtroStatus]);

    return (
        <div className="main-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Servidores</h1>
                    <p>Inventário e estado atual dos ativos monitorados</p>
                </div>

                <div className="dashboard-user">
                    <span className="notification-dot"></span>
                    <div className="user-avatar">AD</div>
                </div>
            </div>

            <div className="servidores-filtros">
                <input
                    type="text"
                    className="campo-busca"
                    placeholder="Buscar servidor..."
                    aria-label="Buscar servidor por nome ou IP"
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                />

                <select
                    className="campo-status"
                    aria-label="Filtrar por status"
                    value={filtroStatus}
                    onChange={(evento) => setFiltroStatus(evento.target.value)}
                >
                    <option value="Todos">Todos os status</option>
                    <option value="Normal">Normal</option>
                    <option value="Atenção">Atenção</option>
                    <option value="Crítico">Crítico</option>
                    <option value="Não informado">Não informado</option>
                </select>
            </div>

            <div className="dashboard-panel">
                <div className="tabela-wrapper">
                    <table className="tabela-servidores">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>IP</th>
                                <th>CPU</th>
                                <th>RAM</th>
                                <th>Disco</th>
                                <th>Status</th>
                                <th>Ação</th>
                            </tr>
                        </thead>

                        <tbody>
                            {!carregando && !erro && servidoresFiltrados.map((servidor) => {
                                const status = obterStatusOperacional(servidor);

                                return (
                                    <tr key={servidor.id}>
                                        <td className="coluna-nome">{servidor.nome}</td>
                                        <td className="coluna-ip">{servidor.ip || "Não cadastrado"}</td>
                                        <td className={classeUso(servidor.cpu_percent)}>
                                            {formatarPercentual(servidor.cpu_percent)}
                                        </td>
                                        <td className={classeUso(servidor.memoria_percent)}>
                                            {formatarPercentual(servidor.memoria_percent)}
                                        </td>
                                        <td>{formatarPercentual(servidor.disco_percent)}</td>
                                        <td>
                                            <span className={`status-badge ${classeStatus(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/servidores/${servidor.id}`}
                                                className="botao-detalhes"
                                            >
                                                Ver detalhes
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {carregando && <p className="tabela-feedback">Carregando servidores...</p>}
                {erro && <p className="tabela-feedback tabela-erro">{erro}</p>}
                {!carregando && !erro && servidoresFiltrados.length === 0 && (
                    <p className="tabela-vazia">
                        Nenhum servidor encontrado. Ajuste a busca ou o filtro de status.
                    </p>
                )}
            </div>
        </div>
    );
}

export default MainServidores;
