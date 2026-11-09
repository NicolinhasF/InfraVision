import React from "react";
import Sidebar from "../../template/Sidebar";
import MainAnalises from "../../MainAnalises";
import "../Dashboard/Dashboard.css";
import "./Analises.css";

function Analises() {
    return (
        <div className="infravision-layout analises-layout">
            <Sidebar />
            <main className="dashboard-content">
                <MainAnalises />
            </main>
        </div>
    );
}

export default Analises;
