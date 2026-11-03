
export const servidores = [

    {
        id: "SRV-01",
        ip: "192.168.1.10",
        cpu: 42,
        ram: 58,
        disco: 61,
        rede: 35,
        status: "Normal",
        eventos: []
    },

    {
        id: "SRV-02",
        ip: "192.168.1.11",
        cpu: 91,
        ram: 87,
        disco: 74,
        rede: 82,
        status: "Crítico",
        eventos: [
            { hora: "14:10", descricao: "CPU ultrapassou 90%" },
            { hora: "14:20", descricao: "RAM ultrapassou 85%" },
            { hora: "14:40", descricao: "Disco ultrapassou 80%" },
            { hora: "12:30", descricao: "Comportamento anômalo detectado" }
        ]
    },

    {
        id: "SRV-03",
        ip: "192.168.1.12",
        cpu: 18,
        ram: 25,
        disco: 40,
        rede: 20,
        status: "Normal",
        eventos: []
    },

    {
        id: "SRV-04",
        ip: "192.168.1.13",
        cpu: 67,
        ram: 71,
        disco: 82,
        rede: 61,
        status: "Atenção",
        eventos: [
            { hora: "13:05", descricao: "Disco ultrapassou 80%" },
            { hora: "11:50", descricao: "RAM ultrapassou 70%" }
        ]
    },

    {
        id: "SRV-05",
        ip: "192.168.1.14",
        cpu: 32,
        ram: 44,
        disco: 55,
        rede: 40,
        status: "Normal",
        eventos: []
    },

    {
        id: "SRV-06",
        ip: "192.168.1.15",
        cpu: 89,
        ram: 91,
        disco: 93,
        rede: 77,
        status: "Crítico",
        eventos: [
            { hora: "14:32", descricao: "RAM ultrapassou 90%" },
            { hora: "14:15", descricao: "Disco ultrapassou 90%" },
            { hora: "13:40", descricao: "CPU ultrapassou 85%" }
        ]
    },

    {
        id: "SRV-07",
        ip: "192.168.1.16",
        cpu: 14,
        ram: 18,
        disco: 30,
        rede: 15,
        status: "Normal",
        eventos: []
    },

    {
        id: "SRV-08",
        ip: "192.168.1.17",
        cpu: 55,
        ram: 62,
        disco: 66,
        rede: 52,
        status: "Atenção",
        eventos: [
            { hora: "12:10", descricao: "RAM ultrapassou 60%" }
        ]
    }

];


export function buscarServidor(id) {
    return servidores.find((servidor) => servidor.id === id);
}


// Histórico das últimas 24 horas (sintético e sempre igual para o mesmo
// servidor). O último ponto é sempre o valor atual do servidor.
const HORARIOS = ["00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h", "Agora"];

export function gerarHistorico(valorAtual, semente) {

    return HORARIOS.map((periodo, indice) => {

        const ultimo = HORARIOS.length - 1;

        if (indice === ultimo) {
            return { periodo, valor: valorAtual };
        }

        const distancia = ultimo - indice;
        const oscilacao = Math.round(Math.sin(indice * 1.9 + semente) * 9);
        const valor = valorAtual - distancia * 2 + oscilacao;

        return {
            periodo,
            valor: Math.max(5, Math.min(99, valor))
        };

    });

}
