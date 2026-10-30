require('dotenv').config();

const Groq = require('groq-sdk');
const { toolDefinitions } = require('../tools/registry');
const { executeTool } = require('../tools/toolExecutor');

const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

const SYSTEM_PROMPT = `
Você é o assistente de inteligência artificial do Infravision.
Responda sempre em português do Brasil, com clareza e precisão.
Seu contexto é monitoramento e análise de infraestrutura de TI.
Use as ferramentas disponíveis quando precisar consultar informações reais do banco.
Nunca invente métricas, análises, previsões ou componentes.
Se uma ferramenta não fornecer determinada informação, informe essa limitação.
Não afirme que executou uma ação que não foi realizada.
`;

async function perguntarAoAssistente(mensagem) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('A variável GROQ_API_KEY não está configurada no arquivo .env.');
    }

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: mensagem },
    ];

    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
        const resposta = await groq.chat.completions.create({
            model: MODEL,
            messages,
            tools: toolDefinitions,
            tool_choice: 'auto',
            temperature: 0.2,
        });

        const mensagemIA = resposta.choices[0]?.message;

        if (!mensagemIA) {
            throw new Error('A Groq retornou uma resposta vazia.');
        }

        messages.push(mensagemIA);

        if (!mensagemIA.tool_calls?.length) {
            return mensagemIA.content || 'Não foi possível gerar uma resposta.';
        }

        for (const chamada of mensagemIA.tool_calls) {
            const nomeFerramenta = chamada.function.name;
            let resultado;

            try {
                const argumentos = JSON.parse(chamada.function.arguments || '{}');
                resultado = await executeTool(nomeFerramenta, argumentos);
            } catch (erro) {
                resultado = { erro: erro.message };
            }

            messages.push({
                role: 'tool',
                tool_call_id: chamada.id,
                content: JSON.stringify(resultado),
            });
        }
    }

    throw new Error('A IA excedeu o limite de etapas de execução de ferramentas.');
}

module.exports = { perguntarAoAssistente };
