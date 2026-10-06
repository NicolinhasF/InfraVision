const usuarioModel = require('../models/models');

const usuarioController = {

    LoginUsuario: async (req, res) => {

        const { usuario, senha } = req.body;

        try {

            const resultado = await usuarioModel.login(
                usuario,
                senha
            );

            if (!resultado) {
                return res.status(401).json({
                    msg: "Usuário ou senha incorretos"
                });
            }

            return res.status(200).json({
                msg: "Login realizado com sucesso",
                id: resultado.id,
                usuario: resultado.usuario
            });

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                msg: "Erro no servidor"
            });

        }
    }

};

module.exports = usuarioController;