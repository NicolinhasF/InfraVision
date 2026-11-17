const express = require('express');
const usuarioController = require('../controller/controller');
const chatController = require('../controller/chatController');
const infraestruturaController = require('../controller/infraestruturaController');
const custosController = require('../controller/custosController');
const previsoesController = require('../controller/previsoesController');
const recomendacoesController = require('../controller/recomendacoesController');
const { alertasController } = require('../controller/alertasController');
const { dashboardController } = require('../controller/dashboardController');
const {
    configuracoesController,
} = require('../controller/configuracoesController');
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
routers.get('/dashboard', dashboardController.buscar);
routers.post('/previsoes/gerar', previsoesController.gerarPrevisoes);
routers.get('/recomendacoes', recomendacoesController.listar);
routers.post('/recomendacoes/gerar', recomendacoesController.gerar);
routers.get('/alertas', alertasController.listar);
routers.get('/configuracoes', configuracoesController.buscar);
routers.put('/configuracoes', configuracoesController.atualizar);
routers.post('/custos/calcular', custosController.calcularCustos);
routers.get('/custos', custosController.listarCustos);
routers.post('/chat', chatController.enviarMensagem);

module.exports = routers;