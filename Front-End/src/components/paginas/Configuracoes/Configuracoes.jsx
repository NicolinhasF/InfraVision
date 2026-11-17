import React from "react";
import Sidebar from "../../template/Sidebar";
import MainConfiguracoes from "../../MainConfiguracoes";
import "../Dashboard/Dashboard.css";
import "./Configuracoes.css";

function Configuracoes() {
    return (
        <div className="infravision-layout">
            <Sidebar />
            <main className="dashboard-content">
                <MainConfiguracoes />
            </main>
        </div>
    );
}

export default Configuracoes;
