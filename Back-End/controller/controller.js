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
    },

    PerfilUsuario: async (req, res) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ msg: "ID de usuário inválido" });
        }

        try {
            const perfil = await usuarioModel.getPerfil(id);

            if (!perfil) {
                return res.status(404).json({ msg: "Usuário não encontrado" });
            }

            return res.status(200).json(perfil);
        } catch (error) {
            console.log(error);

            return res.status(500).json({ msg: "Erro no servidor" });
        }
    },

    AtualizarPerfilUsuario: async (req, res) => {
        const id = Number(req.params.id);
        const { nome, email, cargo } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ msg: "ID de usuário inválido" });
        }

        if (
            typeof nome !== "string" || !nome.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof cargo !== "string" || !cargo.trim()
        ) {
            return res.status(400).json({
                msg: "Informe nome, email e cargo"
            });
        }

        try {
            const atualizado = await usuarioModel.atualizarPerfil(
                id,
                nome.trim(),
                email.trim(),
                cargo.trim()
            );

            if (!atualizado) {
                return res.status(404).json({ msg: "Usuário não encontrado" });
            }

            return res.status(200).json({ msg: "Perfil atualizado com sucesso" });
        } catch (error) {
            console.log(error);

            return res.status(500).json({ msg: "Erro no servidor" });
        }
    },

    AtualizarSenhaUsuario: async (req, res) => {
        const id = Number(req.params.id);
        const { senhaAtual, novaSenha } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ msg: "ID de usuário inválido" });
        }

        if (
            typeof senhaAtual !== "string" || !senhaAtual ||
            typeof novaSenha !== "string" || novaSenha.length < 6
        ) {
            return res.status(400).json({
                msg: "Informe a senha atual e uma nova senha com pelo menos 6 caracteres"
            });
        }

        try {
            const atualizado = await usuarioModel.atualizarSenha(
                id,
                senhaAtual,
                novaSenha
            );

            if (!atualizado) {
                return res.status(401).json({
                    msg: "Usuário não encontrado ou senha atual incorreta"
                });
            }

            return res.status(200).json({ msg: "Senha atualizada com sucesso" });
        } catch (error) {
            console.log(error);

            return res.status(500).json({ msg: "Erro no servidor" });
        }
    }

};

module.exports = usuarioController;