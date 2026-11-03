import React from "react";
import { Link, NavLink } from "react-router-dom";

function Sidebar() {

    const closeOffcanvas = () => {
        const offcanvasElement = document.getElementById("sidebarOffcanvas");

        if (offcanvasElement && window.bootstrap) {
            const instance =
                window.bootstrap.Offcanvas.getInstance(offcanvasElement) ||
                new window.bootstrap.Offcanvas(offcanvasElement);

            instance.hide();
        }
    };

    const menuPrincipal = [
        {
            nome: "Dashboard",
            rota: "/home"
        },
        {
            nome: "Servidores",
            rota: "/servidores"
        },
        {
            nome: "Infraestrutura",
            rota: "/infraestrutura"
        },
        {
            nome: "Análises",
            rota: "/analises"
        },
        {
            nome: "Previsões",
            rota: "/previsoes"
        },
        {
            nome: "Recomendações",
            rota: "/recomendacoes"
        },
        {
            nome: "Custos",
            rota: "/custos"
        }
    ];


    const menuConfiguracoes = [
        {
            nome: "Configurações",
            rota: "/configuracoes"
        },
        {
            nome: "Perfil",
            rota: "/perfil"
        }
    ];


    return (
        <>
            {/* MOBILE */}
            <header className="mobile-header d-md-none">

                <button
                    className="mobile-menu-button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#sidebarOffcanvas"
                >
                    ☰
                </button>

                <Link
                    to="/home"
                    className="sidebar-logo text-decoration-none"
                >
                    Infra <span>Vision</span>
                </Link>

            </header>


            {/* SIDEBAR DESKTOP */}
            <aside className="sidebar d-none d-md-flex">

                <Link
                    to="/home"
                    className="sidebar-logo text-decoration-none"
                >
                    Infra <span>Vision</span>
                </Link>


                <nav className="sidebar-menu">

                    {menuPrincipal.map((item) => (

                        <NavLink
                            key={item.rota}
                            to={item.rota}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            {item.nome}
                        </NavLink>

                    ))}

                </nav>


                <div className="sidebar-divider"></div>


                <nav className="sidebar-menu">

                    {menuConfiguracoes.map((item) => (

                        <NavLink
                            key={item.rota}
                            to={item.rota}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            {item.nome}
                        </NavLink>

                    ))}

                </nav>


                <div className="sidebar-bottom">

                    <Link
                        to="/"
                        className="sidebar-exit"
                    >
                        Sair
                    </Link>

                </div>

            </aside>


            {/* OFFCANVAS MOBILE */}
            <div
                className="offcanvas offcanvas-start sidebar-mobile"
                tabIndex="-1"
                id="sidebarOffcanvas"
            >

                <div className="offcanvas-header">

                    <div className="sidebar-logo">
                        Infra <span>Vision</span>
                    </div>

                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        data-bs-dismiss="offcanvas"
                    ></button>

                </div>


                <div className="offcanvas-body">

                    <nav className="sidebar-menu">

                        {menuPrincipal.map((item) => (

                            <NavLink
                                key={item.rota}
                                to={item.rota}
                                onClick={closeOffcanvas}
                                className={({ isActive }) =>
                                    isActive
                                        ? "sidebar-link active"
                                        : "sidebar-link"
                                }
                            >
                                {item.nome}
                            </NavLink>

                        ))}

                    </nav>


                    <div className="sidebar-divider"></div>


                    <nav className="sidebar-menu">

                        {menuConfiguracoes.map((item) => (

                            <NavLink
                                key={item.rota}
                                to={item.rota}
                                onClick={closeOffcanvas}
                                className={({ isActive }) =>
                                    isActive
                                        ? "sidebar-link active"
                                        : "sidebar-link"
                                }
                            >
                                {item.nome}
                            </NavLink>

                        ))}

                    </nav>


                    <Link
                        to="/"
                        onClick={closeOffcanvas}
                        className="sidebar-exit mobile-exit"
                    >
                        Sair
                    </Link>

                </div>

            </div>
        </>
    );
}

export default Sidebar;