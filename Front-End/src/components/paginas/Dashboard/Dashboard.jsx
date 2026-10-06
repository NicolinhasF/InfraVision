

import MainDashboard from "../../MainDashboard";

import Sidebar from "../../template/Sidebar";


function Dashboard() {

    return (

        <div className="infravision-layout">

            <Sidebar />

            <main className="dashboard-content">

                <MainDashboard />

            </main>

        </div>

    );

}

export default Dashboard;