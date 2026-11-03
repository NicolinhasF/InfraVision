import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./paginas/Dashboard/Dashboard.css";
import "./paginas/Infraestrutura/Infraestrutura.css";


// =====================================================================
// COMUNICAÇÃO COM O BACK-END
//
// Rotas usadas (Back-End/src/routers.js), todas respondem { total, dados: [...] }:
//   GET /componentes      -> [{ id, nome, tipo, descricao, status }]
//   GET /relacionamentos  -> [{ id, origem: {id, nome}, destino: {id, nome}, tipo, descricao }]
//   GET /analises         -> [{ id, componente: {id, nome} | null, severidade, criado_em, ... }]
//
// Se o back-end mudar de endereço, crie o arquivo Front-End/.env com:
//   REACT_APP_API_URL=http://localhost:3001
// =====================================================================

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";


async function buscarLista(rota) {

    const resposta = await axios.get(`${API_URL}${rota}`);

    return Array.isArray(resposta.data?.dados) ? resposta.data.dados : [];
}


// Traduz o erro do axios em uma mensagem para mostrar na tela.
// O back-end responde { erro: "..." } (infraestrutura) ou { msg: "..." } (login/perfil).
function mensagemDeErro(error, padrao) {

    if (error.response) {
        return error.response.data?.erro || error.response.data?.msg || padrao;
    }

    return "Não foi possível conectar ao servidor. Verifique se o back-end está em execução.";
}


// =====================================================================
// FUNÇÕES DO GRAFO
//
// São "puras": recebem os dados que vieram do back-end e devolvem o que
// a tela precisa desenhar (status, dependentes e posição dos nós).
// =====================================================================

// -------------------------
// STATUS DO COMPONENTE
// -------------------------

// O banco guarda a severidade da análise (baixa / media / alta / critica),
// e a tela usa três selos (Normal / Atenção / Crítico).
// Se quiser que "alta" também apareça como Crítico, é só mudar aqui.
const SEVERIDADE_PARA_STATUS = {
    critica: { rotulo: "Crítico", classe: "critico", nivel: 3 },
    alta: { rotulo: "Atenção", classe: "atencao", nivel: 2 },
    media: { rotulo: "Atenção", classe: "atencao", nivel: 2 },
    baixa: { rotulo: "Normal", classe: "normal", nivel: 1 }
};


function capitalizar(texto) {
    if (!texto) {
        return "Sem status";
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}


// Guarda, para cada componente, a análise mais recente.
function analiseMaisRecentePorComponente(analises) {

    const resultado = {};

    analises.forEach((analise) => {

        const id = analise.componente?.id;

        if (id === undefined || id === null) {
            return;
        }

        const atual = resultado[id];

        if (!atual || Date.parse(analise.criado_em) > Date.parse(atual.criado_em)) {
            resultado[id] = analise;
        }

    });

    return resultado;
}


// Decide o selo do componente: usa a severidade da análise mais recente;
// se não houver análise, usa o status cadastrado no componente (ex: "ativo").
function obterStatus(componente, analise) {

    const severidade = analise?.severidade?.toLowerCase();

    if (severidade && SEVERIDADE_PARA_STATUS[severidade]) {
        return SEVERIDADE_PARA_STATUS[severidade];
    }

    if (componente.status?.toLowerCase() === "ativo") {
        return { rotulo: "Normal", classe: "normal", nivel: 1 };
    }

    return { rotulo: capitalizar(componente.status), classe: "neutro", nivel: 0 };
}


// -------------------------
// COR DO NÓ CONFORME O TIPO
// -------------------------

function classeDoTipo(tipo) {

    const texto = (tipo || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (/cloud|nuvem/.test(texto)) return "tipo-nuvem";
    if (/banco|database|dados/.test(texto)) return "tipo-banco";
    if (/backup/.test(texto)) return "tipo-backup";
    if (/roteador|switch|rede|firewall/.test(texto)) return "tipo-rede";
    if (/servidor|server|app|aplicacao/.test(texto)) return "tipo-servidor";

    return "tipo-outro";
}


// -------------------------
// DEPENDENTES E IMPACTOS
// -------------------------

// Dependentes diretos: quem tem um relacionamento APONTANDO para o
// componente (origem -> destino). Ex: "Servidor Web depende_de Banco"
// => o Servidor Web é dependente do Banco.
function dependentesDe(idComponente, relacionamentos) {

    const porOrigem = new Map();

    relacionamentos.forEach((relacionamento) => {

        const origemId = relacionamento.origem?.id;
        const destinoId = relacionamento.destino?.id;

        if (destinoId === idComponente && origemId !== idComponente && !porOrigem.has(origemId)) {
            porOrigem.set(origemId, relacionamento);
        }

    });

    return Array.from(porOrigem.values());
}


// Texto de impacto de um dependente (usa a descrição que veio do banco).
function textoDeImpacto(relacionamento) {

    if (relacionamento.descricao) {
        return relacionamento.descricao;
    }

    const tipo = (relacionamento.tipo || "relacionado").replace(/_/g, " ");

    return `${relacionamento.origem.nome} pode ser afetado (${tipo}).`;
}


// -------------------------
// LAYOUT (POSIÇÃO DOS NÓS)
// -------------------------

const NO_ALTURA = 48;

// Cada nó tem 140px de largura (veja .grafo-no no CSS) + 16px de folga.
const ESPACO_POR_NO = 156;
const ESPACO_ENTRE_CAMADAS = 130;
const MARGEM_VERTICAL = 44;


// Tipos de relacionamento em que a ORIGEM fica ABAIXO do destino.
// Ex: "Servidor de Backup  backup_de  Banco" => o backup fica abaixo do banco.
// Todos os outros tipos (depende_de, conectado_a...) deixam a origem em cima.
const TIPOS_COM_ORIGEM_ABAIXO = ["backup_de"];


// Organiza os componentes em "camadas" (linhas), de cima para baixo.
// x é em porcentagem da largura (a tela se ajusta sozinha) e y em pixels.
function calcularLayout(componentes, relacionamentos) {

    const ids = componentes.map((componente) => componente.id);
    const camadaPorId = {};

    ids.forEach((id) => {
        camadaPorId[id] = 0;
    });

    const arestas = relacionamentos.filter((relacionamento) => {

        const origemId = relacionamento.origem?.id;
        const destinoId = relacionamento.destino?.id;

        return (
            camadaPorId[origemId] !== undefined &&
            camadaPorId[destinoId] !== undefined &&
            origemId !== destinoId
        );

    }).map((relacionamento) => {

        const invertido = TIPOS_COM_ORIGEM_ABAIXO.includes(relacionamento.tipo);

        return {
            ...relacionamento,
            acimaId: invertido ? relacionamento.destino.id : relacionamento.origem.id,
            abaixoId: invertido ? relacionamento.origem.id : relacionamento.destino.id
        };

    });


    // Empurra quem fica abaixo para baixo de quem fica acima. O limite (ids.length - 1)
    // evita loop infinito se existir relacionamento circular.
    const limite = Math.max(ids.length - 1, 0);

    for (let rodada = 0; rodada < ids.length; rodada++) {

        let mudou = false;

        arestas.forEach((aresta) => {

            const nova = camadaPorId[aresta.acimaId] + 1;

            if (camadaPorId[aresta.abaixoId] < nova && nova <= limite) {
                camadaPorId[aresta.abaixoId] = nova;
                mudou = true;
            }

        });

        if (!mudou) {
            break;
        }

    }


    // Renumera as camadas para ficarem 0, 1, 2... sem "buracos"
    const camadasUsadas = Array.from(new Set(ids.map((id) => camadaPorId[id]))).sort((a, b) => a - b);
    const camadas = camadasUsadas.map(() => []);

    componentes.forEach((componente) => {
        camadas[camadasUsadas.indexOf(camadaPorId[componente.id])].push(componente);
    });


    const posicoes = {};
    let maiorCamada = 0;

    camadas.forEach((grupo, indiceCamada) => {

        maiorCamada = Math.max(maiorCamada, grupo.length);

        grupo.forEach((componente, indice) => {

            posicoes[componente.id] = {
                componente,
                camada: indiceCamada,
                x: ((indice + 1) / (grupo.length + 1)) * 100,
                y: MARGEM_VERTICAL + indiceCamada * ESPACO_ENTRE_CAMADAS
            };

        });

    });


    const linhas = arestas.map((aresta) => {

        const acima = posicoes[aresta.acimaId];
        const abaixo = posicoes[aresta.abaixoId];

        const descendo = abaixo.y > acima.y;
        const subindo = abaixo.y < acima.y;
        const meio = NO_ALTURA / 2;

        return {
            id: aresta.id,
            origemId: aresta.origem.id,
            destinoId: aresta.destino.id,
            tipo: aresta.tipo,
            descricao: aresta.descricao,
            x1: acima.x,
            y1: descendo ? acima.y + meio : subindo ? acima.y - meio : acima.y,
            x2: abaixo.x,
            y2: descendo ? abaixo.y - meio : subindo ? abaixo.y + meio : abaixo.y
        };

    });


    return {
        nos: componentes.map((componente) => posicoes[componente.id]),
        linhas,
        altura: MARGEM_VERTICAL * 2 + Math.max(camadas.length - 1, 0) * ESPACO_ENTRE_CAMADAS,
        // Com n nós na mesma linha, a distância entre os centros é
        // largura / (n + 1). Por isso a largura mínima é (n + 1) * espaço.
        // Se a tela for menor que isso, o grafo rola na horizontal.
        larguraMinima: maiorCamada <= 1 ? ESPACO_POR_NO : (maiorCamada + 1) * ESPACO_POR_NO
    };
}


// =====================================================================
// PÁGINA
// =====================================================================

function MainInfraestrutura() {

    const [componentes, setComponentes] = useState([]);
    const [relacionamentos, setRelacionamentos] = useState([]);
    const [analises, setAnalises] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);

    const [selecionadoId, setSelecionadoId] = useState(null);


    // BUSCA OS DADOS NO BACK-END

    useEffect(() => {

        let ativo = true;

        const carregarInfraestrutura = async () => {

            setCarregando(true);
            setErro("");

            try {

                // As três rotas são chamadas ao mesmo tempo
                const [respComponentes, respRelacionamentos, respAnalises] =
                    await Promise.allSettled([
                        buscarLista("/componentes"),
                        buscarLista("/relacionamentos"),
                        buscarLista("/analises")
                    ]);

                if (!ativo) return;

                // Componentes e relacionamentos são obrigatórios para desenhar o grafo
                if (respComponentes.status === "rejected") {
                    throw respComponentes.reason;
                }

                if (respRelacionamentos.status === "rejected") {
                    throw respRelacionamentos.reason;
                }

                setComponentes(respComponentes.value);
                setRelacionamentos(respRelacionamentos.value);

                // Análises só definem a cor do status. Se falharem, o grafo continua
                // aparecendo usando o status cadastrado no próprio componente.
                setAnalises(
                    respAnalises.status === "fulfilled" ? respAnalises.value : []
                );

            } catch (error) {

                if (!ativo) return;

                setErro(
                    mensagemDeErro(
                        error,
                        "Não foi possível carregar os dados da infraestrutura. Tente novamente."
                    )
                );

            } finally {

                if (ativo) setCarregando(false);

            }

        };

        carregarInfraestrutura();

        return () => {
            ativo = false;
        };

    }, [tentativa]);


    // DADOS CALCULADOS A PARTIR DO QUE VEIO DO BACK-END

    const layout = useMemo(
        () => calcularLayout(componentes, relacionamentos),
        [componentes, relacionamentos]
    );

    const statusPorId = useMemo(() => {

        const maisRecentes = analiseMaisRecentePorComponente(analises);
        const resultado = {};

        componentes.forEach((componente) => {
            resultado[componente.id] = obterStatus(componente, maisRecentes[componente.id]);
        });

        return resultado;

    }, [componentes, analises]);


    // Se ninguém foi clicado ainda, começa pelo componente em pior estado
    const selecionado = useMemo(() => {

        const escolhido = componentes.find((componente) => componente.id === selecionadoId);

        if (escolhido) {
            return escolhido;
        }

        return componentes.reduce((pior, componente) => {

            if (!pior) {
                return componente;
            }

            return statusPorId[componente.id].nivel > statusPorId[pior.id].nivel
                ? componente
                : pior;

        }, null);

    }, [componentes, selecionadoId, statusPorId]);


    const dependentes = selecionado
        ? dependentesDe(selecionado.id, relacionamentos)
        : [];

    const statusSelecionado = selecionado ? statusPorId[selecionado.id] : null;


    return (

        <div className="main-dashboard">


            {/* TOPO */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Infraestrutura
                    </h1>

                    <p>
                        Dependências e impacto entre componentes
                    </p>

                </div>


                <div className="dashboard-user">

                    <span className="notification-dot"></span>

                    <div className="user-avatar">
                        AD
                    </div>

                </div>

            </div>


            {/* CARREGANDO / ERRO / VAZIO */}

            {carregando && (

                <div className="infra-mensagem" role="status">
                    Carregando infraestrutura...
                </div>

            )}


            {!carregando && erro && (

                <div className="infra-mensagem infra-mensagem-erro" role="alert">

                    <span>{erro}</span>

                    <button
                        type="button"
                        className="infra-botao-recarregar"
                        onClick={() => setTentativa((valor) => valor + 1)}
                    >
                        Tentar novamente
                    </button>

                </div>

            )}


            {!carregando && !erro && componentes.length === 0 && (

                <div className="infra-mensagem">
                    Nenhum componente de infraestrutura cadastrado ainda.
                </div>

            )}


            {/* GRAFO + COMPONENTE SELECIONADO */}

            {!carregando && !erro && selecionado && (

                <div className="dashboard-grid-main infra-grid">


                    <div className="dashboard-panel">

                        <h2>
                            Grafo de dependências
                        </h2>


                        <div className="grafo-rolagem">

                            <div
                                className="grafo"
                                role="group"
                                aria-label="Grafo de dependências entre os componentes"
                                style={{
                                    height: layout.altura,
                                    minWidth: layout.larguraMinima
                                }}
                            >

                                <svg
                                    className="grafo-linhas"
                                    aria-hidden="true"
                                >

                                    {layout.linhas.map((linha) => {

                                        const ligadaAoSelecionado =
                                            linha.origemId === selecionado.id ||
                                            linha.destinoId === selecionado.id;

                                        return (

                                            <line
                                                key={linha.id}
                                                x1={`${linha.x1}%`}
                                                y1={linha.y1}
                                                x2={`${linha.x2}%`}
                                                y2={linha.y2}
                                                className={
                                                    ligadaAoSelecionado
                                                        ? "grafo-linha grafo-linha-destaque"
                                                        : "grafo-linha"
                                                }
                                            >
                                                {linha.descricao && (
                                                    <title>{linha.descricao}</title>
                                                )}
                                            </line>

                                        );

                                    })}

                                </svg>


                                {layout.nos.map((no) => {

                                    const status = statusPorId[no.componente.id];
                                    const ehSelecionado = no.componente.id === selecionado.id;

                                    return (

                                        <button
                                            type="button"
                                            key={no.componente.id}
                                            className={
                                                `grafo-no ${classeDoTipo(no.componente.tipo)}` +
                                                (ehSelecionado ? " grafo-no-selecionado" : "")
                                            }
                                            style={{
                                                left: `${no.x}%`,
                                                top: no.y
                                            }}
                                            aria-pressed={ehSelecionado}
                                            title={`${no.componente.nome} — ${status.rotulo}`}
                                            onClick={() => setSelecionadoId(no.componente.id)}
                                        >

                                            <span
                                                className={`grafo-no-ponto ${status.classe}`}
                                                aria-hidden="true"
                                            ></span>

                                            <span className="grafo-no-nome">
                                                {no.componente.nome}
                                            </span>

                                        </button>

                                    );

                                })}

                            </div>

                        </div>


                        <p className="grafo-legenda">
                            Clique em um componente para ver quem depende dele
                            e o impacto em caso de falha.
                        </p>

                    </div>


                    <div className="dashboard-panel infra-detalhe">

                        <span className="infra-detalhe-rotulo">
                            Componente selecionado
                        </span>

                        <h3 className="infra-detalhe-nome">
                            {selecionado.nome}
                        </h3>

                        <span className={`status-badge ${statusSelecionado.classe}`}>
                            {statusSelecionado.rotulo}
                        </span>


                        <p className="infra-detalhe-dependentes">

                            <strong>
                                {dependentes.length}
                            </strong>

                            {" "}
                            {dependentes.length === 1
                                ? "serviço dependente"
                                : "serviços dependentes"}

                        </p>


                        <span className="infra-detalhe-rotulo">
                            Possíveis impactos
                        </span>

                        {dependentes.length === 0 ? (

                            <p className="infra-detalhe-vazio">
                                Nenhum componente depende deste.
                            </p>

                        ) : (

                            <ul className="infra-impactos">

                                {dependentes.map((relacionamento) => (

                                    <li key={relacionamento.id}>
                                        {textoDeImpacto(relacionamento)}
                                    </li>

                                ))}

                            </ul>

                        )}

                    </div>


                </div>

            )}


        </div>

    );
}

export default MainInfraestrutura;
