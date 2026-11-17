import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const CONFIGURACOES_PADRAO = {
    atualizacao_automatica: true,
    intervalo_minutos: 5,
    alertas_criticos: true,
    alertas_economia: false,
    alerta_cpu: true,
    limite_cpu: 80,
    alerta_ram: true,
    limite_ram: 85,
    alerta_disco: true,
    limite_disco: 90,
};

function SwitchConfiguracao({ campo, label, config, disabled, onChange }) {
    return (
        <label className="config-switch-row">
            <span>{label}</span>
            <input
                type="checkbox"
                checked={Boolean(config[campo])}
                disabled={disabled}
                onChange={(event) => onChange(campo, event.target.checked)}
            />
            <span className="config-switch" aria-hidden="true"></span>
        </label>
    );
}

function MainConfiguracoes() {
    const [config, setConfig] = useState(CONFIGURACOES_PADRAO);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const carregarConfiguracoes = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const resposta = await api.get("/configuracoes");
            setConfig({
                ...CONFIGURACOES_PADRAO,
                ...(resposta.data?.dados || {}),
            });
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar as configurações."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarConfiguracoes();
    }, [carregarConfiguracoes]);

    const atualizarConfiguracao = async (campo, valor) => {
        const configuracaoAnterior = config;
        const novaConfiguracao = { ...config, [campo]: valor };

        setConfig(novaConfiguracao);
        setSalvando(true);
        setErro("");
        setMensagem("");

        try {
            const resposta = await api.put("/configuracoes", novaConfiguracao);
            setConfig({
                ...CONFIGURACOES_PADRAO,
                ...(resposta.data?.dados || novaConfiguracao),
            });
            window.dispatchEvent(new Event("infravision:configuracoes-atualizadas"));
            setMensagem("Configurações salvas com sucesso.");
        } catch (error) {
            setConfig(configuracaoAnterior);
            setErro(
                error.response?.data?.erro ||
                "Não foi possível salvar a configuração."
            );
        } finally {
            setSalvando(false);
        }
    };

    const propriedadesSwitch = {
        config,
        disabled: salvando || carregando,
        onChange: atualizarConfiguracao,
    };

    return (
        <section className="configuracoes-page">
            <header className="configuracoes-header">
                <div>
                    <h1>Configurações</h1>
                    <p>Preferências de monitoramento, alertas e notificações</p>
                </div>
                <div className="configuracoes-user-area">
                    <span className="notification-dot" aria-hidden="true"></span>
                    <div className="user-avatar" aria-label="Usuário">AD</div>
                </div>
            </header>

            {erro && <div className="config-feedback error" role="alert">{erro}</div>}
            {mensagem && <div className="config-feedback success" role="status">{mensagem}</div>}

            {carregando ? (
                <p className="config-loading" role="status">Carregando configurações...</p>
            ) : (
                <div className="configuracoes-grid">
                    <div className="configuracoes-column">
                        <section className="config-card">
                            <h2>Monitoramento</h2>
                            <SwitchConfiguracao
                                {...propriedadesSwitch}
                                campo="atualizacao_automatica"
                                label="Atualização automática"
                            />
                            <div className="config-select-row">
                                <label htmlFor="intervalo-monitoramento">Intervalo</label>
                                <select
                                    id="intervalo-monitoramento"
                                    value={config.intervalo_minutos}
                                    disabled={salvando}
                                    onChange={(event) =>
                                        atualizarConfiguracao(
                                            "intervalo_minutos",
                                            Number(event.target.value)
                                        )
                                    }
                                >
                                    <option value={1}>1 minuto</option>
                                    <option value={5}>5 minutos</option>
                                    <option value={10}>10 minutos</option>
                                    <option value={15}>15 minutos</option>
                                    <option value={30}>30 minutos</option>
                                </select>
                            </div>
                        </section>

                        <section className="config-card">
                            <h2>Notificações</h2>
                            <SwitchConfiguracao
                                {...propriedadesSwitch}
                                campo="alertas_criticos"
                                label="Alertas críticos"
                            />
                            <SwitchConfiguracao
                                {...propriedadesSwitch}
                                campo="alertas_economia"
                                label="Alertas de economia"
                            />
                        </section>
                    </div>

                    <section className="config-card config-alert-card">
                        <h2>Alertas</h2>
                        <SwitchConfiguracao
                            {...propriedadesSwitch}
                            campo="alerta_cpu"
                            label={`CPU acima de ${config.limite_cpu}%`}
                        />
                        <SwitchConfiguracao
                            {...propriedadesSwitch}
                            campo="alerta_ram"
                            label={`RAM acima de ${config.limite_ram}%`}
                        />
                        <SwitchConfiguracao
                            {...propriedadesSwitch}
                            campo="alerta_disco"
                            label={`Disco acima de ${config.limite_disco}%`}
                        />
                    </section>
                </div>
            )}

            {!carregando && (
                <p className="config-note">
                    {config.atualizacao_automatica
                        ? `As telas com dados monitorados serão atualizadas a cada ${config.intervalo_minutos} ${Number(config.intervalo_minutos) === 1 ? "minuto" : "minutos"}.`
                        : "A atualização periódica das telas está desativada."}
                    {" "}Essa opção não inicia a coleta de métricas nos servidores.
                </p>
            )}

            {salvando && <p className="config-saving" role="status">Salvando configurações...</p>}
        </section>
    );
}

export default MainConfiguracoes;
