const express = require('express');
const usuarioController = require('../controller/controller');
const chatController = require('../controller/chatController');
const infraestruturaController = require('../controller/infraestruturaController');
const routers = express.Router();

routers.post('/login', usuarioController.LoginUsuario);
routers.get('/ListarPerfil/:id', usuarioController.PerfilUsuario);
routers.put('/AtualizarPerfil/:id', usuarioController.AtualizarPerfilUsuario);
routers.put('/AtualizarSenhaPerfil/:id/senha', usuarioController.AtualizarSenhaUsuario);
routers.get('/perfil/:id', usuarioController.PerfilUsuario);
routers.put('/perfil/:id', usuarioController.AtualizarPerfilUsuario);
routers.put('/perfil/:id/senha', usuarioController.AtualizarSenhaUsuario);

routers.get('/componentes', infraestruturaController.listarComponentes);
routers.get('/servidores', infraestruturaController.listarServidores);
routers.get('/relacionamentos', infraestruturaController.listarRelacionamentos);
routers.get('/metricas', infraestruturaController.listarMetricas);
routers.get('/analises', infraestruturaController.listarAnalises);
routers.get('/previsoes', infraestruturaController.listarPrevisoes);

routers.post('/chat', chatController.enviarMensagem);

module.exports = routers;