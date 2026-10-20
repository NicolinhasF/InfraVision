const express = require('express');
const usuarioController = require('../controller/controller');
const routers = express.Router();

// login
routers.post('/login', usuarioController.LoginUsuario);
routers.get('/ListarPerfil/:id', usuarioController.PerfilUsuario);
routers.put('/AtualizarPerfil/:id', usuarioController.AtualizarPerfilUsuario);
routers.put('/AtualizarSenhaPerfil/:id/senha', usuarioController.AtualizarSenhaUsuario);
routers.get('/perfil/:id', usuarioController.PerfilUsuario);
routers.put('/perfil/:id', usuarioController.AtualizarPerfilUsuario);
routers.put('/perfil/:id/senha', usuarioController.AtualizarSenhaUsuario);


module.exports = routers;