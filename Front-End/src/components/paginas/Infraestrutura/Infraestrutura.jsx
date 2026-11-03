import MainInfraestrutura from "../../MainInfraestrutura";

import Sidebar from "../../template/Sidebar";


function Infraestrutura() {

    return (

        <div className="infravision-layout">

            <Sidebar />

            <main className="dashboard-content">

                <MainInfraestrutura />

            </main>

        </div>

    );

}

export default Infraestrutura;
