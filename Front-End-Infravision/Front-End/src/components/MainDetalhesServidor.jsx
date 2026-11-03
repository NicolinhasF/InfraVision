import React from "react";
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
    Cell
} from "recharts";

import { buscarServidor, gerarHistorico } from "../dados/servidores";

import "./paginas/Dashboard/Dashboard.css";
import "./paginas/DetalhesServidor/DetalhesServidor.css";


function MainDetalhesServidor() {

    // O código do servidor vem da URL: /servidores/SRV-02
    const { id } = useParams();

    const servidor = buscarServidor(id);


    // TOPO (usado também quando o servidor não existe)

    const topo = (titulo) => (

        <div className="dashboard-header">

            <div>

                <h1>
                    {titulo}
                </h1>

                <Link
                    to="/servidores"
                    className="link-voltar"
                >
                    ← Voltar
                </Link>

            </div>


            <div className="dashboard-user">

                <span className="notification-dot"></span>

                <div className="user-avatar">
                    AD
                </div>

            </div>

        </div>

    );


    if (!servidor) {

        return (

            <div className="main-dashboard">

                {topo("Servidor não encontrado")}

                <div className="dashboard-panel">

                    <p className="eventos-vazio">
                        Não existe nenhum servidor com o código {id}.
                        Volte para a lista e escolha um servidor monitorado.
                    </p>

                </div>

            </div>

        );

    }


    // DADOS SINTÉTICOS DOS GRÁFICOS (últimas 24 horas)

    const semente = parseInt(servidor.id.replace(/\D/g, ""), 10);

    const historicoCpu = gerarHistorico(servidor.cpu, semente);

    const historicoRam = gerarHistorico(servidor.ram, semente + 3);


    const dadosDisco = [

        {
            nome: "Usado",
            valor: servidor.disco
        },

        {
            nome: "Livre",
            valor: 100 - servidor.disco
        }

    ];


    const metricas = [

        { titulo: "CPU", valor: servidor.cpu },
        { titulo: "RAM", valor: servidor.ram },
        { titulo: "DISCO", valor: servidor.disco },
        { titulo: "REDE", valor: servidor.rede }

    ];


    return (

        <div className="main-dashboard">


            {/* TOPO */}

            {topo(servidor.id)}


            {/* CARDS */}

            <div className="detalhes-cards">

                {metricas.map((metrica) => (

                    <div
                        className="metric-card"
                        key={metrica.titulo}
                    >

                        <span className="metric-title">
                            {metrica.titulo}
                        </span>

                        <strong>
                            {metrica.valor}%
                        </strong>

                    </div>

                ))}

            </div>


            {/* GRÁFICOS CPU E RAM */}

            <div className="detalhes-graficos">


                <div className="dashboard-panel">

                    <h2>
                        CPU — últimas 24 horas
                    </h2>

                    <div className="grafico-detalhe">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <LineChart data={historicoCpu}>

                                <CartesianGrid
                                    stroke="#ebeaf2"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="periodo"
                                    hide
                                />

                                <YAxis
                                    hide
                                    domain={[0, 100]}
                                />

                                <Tooltip
                                    formatter={(valor) => `${valor}%`}
                                />

                                <Line
                                    type="monotone"
                                    name="CPU"
                                    dataKey="valor"
                                    stroke="#ef3b45"
                                    strokeWidth={3}
                                    dot={false}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                <div className="dashboard-panel">

                    <h2>
                        RAM — últimas 24 horas
                    </h2>

                    <div className="grafico-detalhe">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <LineChart data={historicoRam}>

                                <CartesianGrid
                                    stroke="#ebeaf2"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="periodo"
                                    hide
                                />

                                <YAxis
                                    hide
                                    domain={[0, 100]}
                                />

                                <Tooltip
                                    formatter={(valor) => `${valor}%`}
                                />

                                <Line
                                    type="monotone"
                                    name="RAM"
                                    dataKey="valor"
                                    stroke="#6c32ff"
                                    strokeWidth={3}
                                    dot={false}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


            </div>


            {/* DISCO E EVENTOS */}

            <div className="detalhes-inferior">


                <div className="dashboard-panel">

                    <h2>
                        Disco
                    </h2>

                    <div className="disco-grafico">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <PieChart>

                                <Pie
                                    data={dadosDisco}
                                    dataKey="valor"
                                    nameKey="nome"
                                    innerRadius="72%"
                                    outerRadius="95%"
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                >

                                    <Cell fill="#6c32ff" />

                                    <Cell fill="#ebe5ff" />

                                </Pie>

                            </PieChart>

                        </ResponsiveContainer>

                        <span className="disco-valor">
                            {servidor.disco}%
                        </span>

                    </div>

                </div>


                <div className="dashboard-panel">

                    <h2>
                        Eventos recentes
                    </h2>

                    {servidor.eventos.length === 0 ? (

                        <p className="eventos-vazio">
                            Nenhum evento registrado nas últimas 24 horas.
                        </p>

                    ) : (

                        <ul className="eventos-lista">

                            {servidor.eventos.map((evento, indice) => (

                                <li key={indice}>

                                    <span className="evento-hora">
                                        {evento.hora}
                                    </span>

                                    <span className="evento-descricao">
                                        {evento.descricao}
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
