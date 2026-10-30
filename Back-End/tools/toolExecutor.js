const { toolsRegistry } = require('./registry');

async function executeTool(nome, argumentos) {
    const ferramenta = toolsRegistry[nome];

    if (!ferramenta) {
        throw new Error(`Ferramenta não encontrada: ${nome}`);
    }

    if (argumentos === null || typeof argumentos !== 'object' || Array.isArray(argumentos)) {
        throw new Error('Os argumentos da ferramenta devem ser um objeto JSON.');
    }

    return ferramenta.execute(argumentos);
}

module.exports = { executeTool };
