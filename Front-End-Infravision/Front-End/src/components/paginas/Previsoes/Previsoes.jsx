import React from "react";
import Sidebar from "../../template/Sidebar";
import MainPrevisoes from "../../MainPrevisoes";
import "../Dashboard/Dashboard.css";
import "./Previsoes.css";

function Previsoes() {
    return (
        <div className="infravision-layout previsoes-layout">
            <Sidebar />
            <main className="dashboard-content">
                <MainPrevisoes />
            </main>
        </div>
    );
}

export default Previsoes;
