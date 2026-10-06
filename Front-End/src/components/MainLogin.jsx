import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./paginas/Login/Login.css";

function MainLogin() {

    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erroMensagem, setErroMensagem] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setErroMensagem("");

        try {

            const response = await axios.post(
                "http://localhost:3001/login",
                {
                    usuario,
                    senha
                }
            );

            if (response.status === 200) {
                navigate("/home");
            }

        } catch (error) {

            if (error.response?.status === 401) {
                setErroMensagem("Usuário ou senha incorretos");
            } else {
                setErroMensagem("Erro ao conectar com o servidor");
            }

        }
    };

    return (
        <div className="login-page">

            <div className="login-content">

                <div className="brand-area">
                    <h1 className="brand-title">
                        Infra <span>Vision</span>
                    </h1>

                    <p className="brand-subtitle">
                        MONITORE • ANALISE • OTIMIZE
                    </p>
                </div>


                <div className="login-card">

                    <h2 className="login-card-title">
                        Acesse sua conta
                    </h2>


                    {erroMensagem && (
                        <p className="error-message">
                            {erroMensagem}
                        </p>
                    )}


                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >

                        <div className="input-group">

                            <label>
                                Usuário:
                            </label>

                            <input
                                type="text"
                                placeholder="Digite seu usuário"
                                value={usuario}
                                onChange={(e) =>
                                    setUsuario(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="input-group">

                            <label>
                                Senha:
                            </label>

                            <input
                                type="password"
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) =>
                                    setSenha(e.target.value)
                                }
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-button"
                        >
                            Entrar
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default MainLogin;