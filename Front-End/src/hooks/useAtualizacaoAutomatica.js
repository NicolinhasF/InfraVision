import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const INTERVALOS_PERMITIDOS = [1, 5, 10, 15, 30];

function useAtualizacaoAutomatica(atualizarDados) {
    const atualizarDadosRef = useRef(atualizarDados);
    const [configuracao, setConfiguracao] = useState(null);

    useEffect(() => {
        atualizarDadosRef.current = atualizarDados;
    }, [atualizarDados]);

    useEffect(() => {
        let ativo = true;

        if (!sessionStorage.getItem("accessToken")) {
            return () => {
                ativo = false;
            };
        }

        api.get("/configuracoes")
            .then((resposta) => {
                if (ativo) setConfiguracao(resposta.data?.dados || null);
            })
            .catch((error) => {
                if (ativo) {
                    console.error(
                        "Não foi possível carregar as preferências de atualização automática:",
                        error.response?.data?.erro || error.message
                    );
                }
            });

        return () => {
            ativo = false;
        };
    }, []);

    useEffect(() => {
        const intervaloMinutos = Number(configuracao?.intervalo_minutos);

        if (configuracao?.atualizacao_automatica !== true) return undefined;
        if (!INTERVALOS_PERMITIDOS.includes(intervaloMinutos)) {
            console.error("Intervalo de atualização automática inválido.");
            return undefined;
        }

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                atualizarDadosRef.current();
            }
        }, intervaloMinutos * 60 * 1000);

        return () => window.clearInterval(timer);
    }, [configuracao]);
}

export default useAtualizacaoAutomatica;
