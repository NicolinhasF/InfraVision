/**
 * Converte o status armazenado e as últimas métricas em um status visual.
 * Limites operacionais usados na interface:
 * - Crítico: CPU/RAM >= 85% ou disco >= 90%.
 * - Atenção: CPU/RAM >= 60% ou disco >= 80%.
 * O status crítico/atenção salvo no banco também é respeitado.
 */
export function obterStatusOperacional(servidor) {
    const statusBanco = String(servidor?.status || "").trim().toLowerCase();
    const cpu = numeroOuNulo(servidor?.cpu_percent);
    const memoria = numeroOuNulo(servidor?.memoria_percent);
    const disco = numeroOuNulo(servidor?.disco_percent);

    const valores = [cpu, memoria, disco];
    const criticoPorMetrica = cpu >= 85 || memoria >= 85 || disco >= 90;
    const atencaoPorMetrica = cpu >= 60 || memoria >= 60 || disco >= 80;

    if (statusBanco.includes("crit") || criticoPorMetrica) return "Crítico";
    if (statusBanco.includes("aten") || atencaoPorMetrica) return "Atenção";
    if (statusBanco === "ativo" || statusBanco === "normal") return "Normal";
    if (valores.every((valor) => valor === null)) return "Não informado";
    return "Normal";
}

function numeroOuNulo(valor) {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}
