import React, { useState } from "react";
import { Link } from "react-router-dom";

import { servidores } from "../dados/servidores";

import "./paginas/Dashboard/Dashboard.css";
import "./paginas/Servidores/Servidores.css";


// Cor do número conforme o nível de uso
function classeUso(valor) {

    if (valor >= 85) {
        return "uso-alto";
    }

    if (valor >= 60) {
        return "uso-medio";
    }

    return "uso-baixo";
}


// Converte o texto do status na classe de cor da etiqueta
function classeStatus(status) {

    if (status === "Crítico") {
        return "critico";
    }

    if (status === "Atenção") {
        return "atencao";
    }

    return "normal";
}


function MainServidores() {

    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("Todos");


    const servidoresFiltrados = servidores.filter((servidor) => {

        const termo = busca.trim().toLowerCase();

        const combinaBusca =
            servidor.id.toLowerCase().includes(termo) ||
            servidor.ip.includes(termo);

        const combinaStatus =
            filtroStatus === "Todos" ||
            servidor.status === filtroStatus;

        return combinaBusca && combinaStatus;

    });


    return (

        <div className="main-dashboard">


            {/* TOPO */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Servidores
                    </h1>

                    <p>
                        Inventário e estado atual dos ativos monitorados
                    </p>

                </div>


                <div className="dashboard-user">

                    <span className="notification-dot"></span>

                    <div className="user-avatar">
                        AD
                    </div>

                </div>

            </div>


            {/* BUSCA E FILTRO */}

            <div className="servidores-filtros">

                <input
                    type="text"
                    className="campo-busca"
                    placeholder="Buscar servidor..."
                    aria-label="Buscar servidor por nome ou IP"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                <select
                    className="campo-status"
                    aria-label="Filtrar por status"
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                >
                    <option value="Todos">Todos os status</option>
                    <option value="Normal">Normal</option>
                    <option value="Atenção">Atenção</option>
                    <option value="Crítico">Crítico</option>
                </select>

            </div>


            {/* TABELA */}

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

                            {servidoresFiltrados.map((servidor) => (

                                <tr key={servidor.id}>

                                    <td className="coluna-nome">
                                        {servidor.id}
                                    </td>

                                    <td className="coluna-ip">
                                        {servidor.ip}
                                    </td>

                                    <td className={classeUso(servidor.cpu)}>
                                        {servidor.cpu}%
                                    </td>

                                    <td className={classeUso(servidor.ram)}>
                                        {servidor.ram}%
                                    </td>

                                    <td>
                                        {servidor.disco}%
                                    </td>

                                    <td>

                                        <span
                                            className={
                                                `status-badge ${classeStatus(servidor.status)}`
                                            }
                                        >
                                            {servidor.status}
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

                            ))}

                        </tbody>

                    </table>

                </div>


                {servidoresFiltrados.length === 0 && (

                    <p className="tabela-vazia">
                        Nenhum servidor encontrado. Ajuste a busca ou o filtro de status.
                    </p>

                )}

            </div>


        </div>

    );
}

export default MainServidores;
