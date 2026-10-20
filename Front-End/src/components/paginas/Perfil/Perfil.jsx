import MainPerfil from "../../MainPerfil";
import Sidebar from "../../template/Sidebar";

function Perfil() {
    return (
        <div className="infravision-layout">
            <Sidebar />

            <main className="dashboard-content">
                <MainPerfil />
            </main>
        </div>
    );
}

export default Perfil;
