import MainDetalhesServidor from "../../MainDetalhesServidor";

import Sidebar from "../../template/Sidebar";


function DetalhesServidor() {

    return (

        <div className="infravision-layout">

            <Sidebar />

            <main className="dashboard-content">

                <MainDetalhesServidor />

            </main>

        </div>

    );

}

export default DetalhesServidor;
