const executeQuery = require('../database/query');

const Usuarios = {

    login: async (usuario, senha) => {
        try {
            const consulta = await Usuarios.getUsuario(usuario);

            if (consulta.length === 0) {
                return null;
            }

            const usuarioEncontrado = consulta[0];

            if (senha !== usuarioEncontrado.senha) {
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
    }
};

module.exports = Usuarios;