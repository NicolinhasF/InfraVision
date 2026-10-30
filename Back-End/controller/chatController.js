const { perguntarAoAssistente } = require('../services/aiService');

const ChatController = {
    enviarMensagem: async (req, res) => {
        const { mensagem } = req.body;

        if (typeof mensagem !== 'string' || !mensagem.trim()) {
            return res.status(400).json({
                erro: 'Informe uma mensagem válida.',
            });
        }

        try {
            const resposta = await perguntarAoAssistente(mensagem.trim());
            return res.status(200).json({ resposta });
        } catch (erro) {
            console.error(
                'Erro ao consultar a IA:',
                erro.status || erro.response?.status || erro.message
            );

            return res.status(502).json({
                erro: 'Não foi possível obter resposta do serviço de IA.',
            });
        }
    },
};

module.exports = ChatController;
