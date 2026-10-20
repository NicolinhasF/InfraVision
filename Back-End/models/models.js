const executeQuery = require('../database/query');
const bcrypt = require('bcrypt');

const Usuarios = {

    login: async (usuario, senha) => {
        try {
            const consulta = await Usuarios.getUsuario(usuario);

            if (consulta.length === 0) {
                return null;
            }

            const usuarioEncontrado = consulta[0];
            const senhaValida = usuarioEncontrado.senha.startsWith('$2')
                ? await bcrypt.compare(senha, usuarioEncontrado.senha)
                : senha === usuarioEncontrado.senha;

            if (!senhaValida) {
                return null;
            }

            return {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario
            };

        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getUsuario: async (usuario) => {
        try {
            return await executeQuery(
                'SELECT id, usuario, senha FROM usuario WHERE usuario = ?',
                [usuario]
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getPerfil: async (id) => {
        try {
            const consulta = await executeQuery(
                'SELECT id, nome, usuario AS email, cargo FROM usuario WHERE id = ?',
                [id]
            );

            return consulta[0] || null;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    atualizarPerfil: async (id, nome, email, cargo) => {
        try {
            const resultado = await executeQuery(
                'UPDATE usuario SET nome = ?, usuario = ?, cargo = ? WHERE id = ?',
                [nome, email, cargo, id]
            );

            if (resultado.affectedRows > 0) {
                return true;
            }

            const consulta = await executeQuery(
                'SELECT id FROM usuario WHERE id = ?',
                [id]
            );

            return consulta.length > 0;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    atualizarSenha: async (id, senhaAtual, novaSenha) => {
        try {
            const consulta = await executeQuery(
                'SELECT senha FROM usuario WHERE id = ?',
                [id]
            );

            if (consulta.length === 0) {
                return false;
            }

            const senhaArmazenada = consulta[0].senha;
            const senhaAtualValida = senhaArmazenada.startsWith('$2')
                ? await bcrypt.compare(senhaAtual, senhaArmazenada)
                : senhaAtual === senhaArmazenada;

            if (!senhaAtualValida) {
                return false;
            }

            const senhaHash = await bcrypt.hash(novaSenha, 10);
            const resultado = await executeQuery(
                'UPDATE usuario SET senha = ? WHERE id = ?',
                [senhaHash, id]
            );

            return resultado.affectedRows > 0;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
};

module.exports = Usuarios;