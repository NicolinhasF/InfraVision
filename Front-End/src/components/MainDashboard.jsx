import React from "react";
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


function MainDashboard() {


    // DADOS SINTÉTICOS DO GRÁFICO

    const dadosInfraestrutura = [

        {
            periodo: "08h",
            cpu: 36,
            ram: 28
        },

        {
            periodo: "10h",
            cpu: 45,
            ram: 34
        },

        {
            periodo: "12h",
            cpu: 48,
            ram: 29
        },

        {
            periodo: "14h",
            cpu: 61,
            ram: 43
        },

        {
            periodo: "16h",
            cpu: 55,
            ram: 51
        },

        {
            periodo: "18h",
            cpu: 72,
            ram: 45
        },

        {
            periodo: "20h",
            cpu: 78,
            ram: 64
        },

        {
            periodo: "22h",
            cpu: 82,
            ram: 69
        },

        {
            periodo: "00h",
            cpu: 91,
            ram: 83
        }

    ];


    const alertas = [

        {
            servidor: "SRV-02",
            problema: "CPU acima de 90%",
            status: "Crítico",
            classe: "critico"
        },

        {
            servidor: "SRV-07",
            problema: "RAM acima de 85%",
            status: "Atenção",
            classe: "atencao"
        },

        {
            servidor: "SRV-11",
            problema: "Disco acima de 90%",
            status: "Crítico",
            classe: "critico"
        }

    ];


    return (

        <div className="main-dashboard">


            {/* TOPO */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>



                </div>


                <div className="dashboard-user">

                    <span className="notification-dot"></span>

                    <div className="user-avatar">
                        AD
                    </div>

                </div>

            </div>



            {/* CARDS */}

            <div className="dashboard-cards">


                <div className="metric-card">

                    <span className="metric-title">
                        SERVIDORES
                    </span>

                    <strong>
                        24
                    </strong>

                </div>


                <div className="metric-card">

                    <span className="metric-title">
                        CPU MÉDIA
                    </span>

                    <strong>
                        56%
                    </strong>

                </div>


                <div className="metric-card">

                    <span className="metric-title">
                        RAM MÉDIA
                    </span>

                    <strong>
                        64%
                    </strong>

                </div>


                <div className="metric-card metric-card-large">

                    <span className="metric-title">
                        CUSTO MENSAL
                    </span>

                    <strong>
                        R$ 8.420
                    </strong>

                </div>


            </div>



            {/* GRÁFICO + STATUS */}

            <div className="dashboard-grid-main">


                <div className="dashboard-panel chart-panel">


                    <div className="panel-header">

                        <h2>
                            Utilização da infraestrutura
                        </h2>


                        <div className="chart-legends">

                            <span className="cpu-legend">
                                CPU
                            </span>

                            <span className="ram-legend">
                                RAM
                            </span>

                        </div>

                    </div>


                    <div className="chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <LineChart
                                data={dadosInfraestrutura}
                            >

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

                                <Tooltip />


                                <Line
                                    type="monotone"
                                    dataKey="cpu"
                                    stroke="#6c32ff"
                                    strokeWidth={3}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="ram"
                                    stroke="#3c72ff"
                                    strokeWidth={3}
                                    dot={false}
                                />


                            </LineChart>

                        </ResponsiveContainer>

                    </div>


                </div>



                {/* STATUS */}

                <div className="dashboard-panel status-panel">


                    <h2>
                        Status
                    </h2>


                    <div className="status-row">

                        <span className="status-badge normal">
                            Normal
                        </span>

                        <strong className="status-value normal-number">
                            14
                        </strong>

                    </div>


                    <div className="status-row">

                        <span className="status-badge atencao">
                            Atenção
                        </span>

                        <strong className="status-value attention-number">
                            6
                        </strong>

                    </div>


                    <div className="status-row">

                        <span className="status-badge critico">
                            Crítico
                        </span>

                        <strong className="status-value critical-number">
                            4
                        </strong>

                    </div>


                    <div className="economia">

                        <span>
                            Economia potencial
                        </span>

                        <strong>
                            R$ 1.280/mês
                        </strong>

                    </div>


                </div>


            </div>



            {/* PARTE INFERIOR */}

            <div className="dashboard-grid-bottom">


                {/* ALERTAS */}

                <div className="dashboard-panel">


                    <h2>
                        Alertas recentes
                    </h2>


                    <div className="alerts-list">


                        {alertas.map((alerta, index) => (

                            <div
                                className="alert-row"
                                key={index}
                            >

                                <strong>
                                    {alerta.servidor}
                                </strong>


                                <span>
                                    {alerta.problema}
                                </span>


                                <span
                                    className={
                                        `status-badge ${alerta.classe}`
                                    }
                                >
                                    {alerta.status}
                                </span>


                            </div>

                        ))}


                    </div>


                </div>



                {/* PREVISÃO */}

                <div className="dashboard-panel prediction-panel">


                    <h2>
                        Previsão importante
                    </h2>


                    <p className="prediction-message">

                        <strong>
                            SRV-02 pode atingir nível crítico
                        </strong>

                        {" "}em aproximadamente 3 horas.

                    </p>


                    <div className="prediction-risk">

                        <span>
                            Risco previsto
                        </span>

                        <strong>
                            87%
                        </strong>

                    </div>


                </div>


            </div>


        </div>

    );
}

export default MainDashboard;