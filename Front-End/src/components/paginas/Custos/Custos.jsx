
import React from "react";
import Sidebar from "../../template/Sidebar";
import MainCustos from "../../MainCustos";
import "../Dashboard/Dashboard.css";
import "./custos.css";

function Custos() {
    return (
        <div className="infravision-layout custos-layout">
            <Sidebar />

            <main className="dashboard-content">
                <MainCustos />
            </main>
        </div>
    );
}

export default Custos;
