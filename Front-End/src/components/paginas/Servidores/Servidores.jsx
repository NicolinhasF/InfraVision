import MainServidores from "../../MainServidores";

import Sidebar from "../../template/Sidebar";


function Servidores() {

    return (

        <div className="infravision-layout">

            <Sidebar />

            <main className="dashboard-content">

                <MainServidores />

            </main>

        </div>

    );

}

export default Servidores;
