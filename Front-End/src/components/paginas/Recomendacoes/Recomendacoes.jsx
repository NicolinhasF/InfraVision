import React from "react";
import Sidebar from "../../template/Sidebar";
import MainRecomendacoes from "../../MainRecomendacoes";
import "../Dashboard/Dashboard.css";
import "./Recomendacoes.css";

function Recomendacoes() {
    return (
        <div className="infravision-layout">
            <Sidebar />
            <main className="dashboard-content">
                <MainRecomendacoes />
            </main>
        </div>
    );
}

export default Recomendacoes;
