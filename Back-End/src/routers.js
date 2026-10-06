const express = require('express');
const usuarioController = require('../controller/controller');
const routers = express.Router();

// login
routers.post('/login', usuarioController.LoginUsuario);


module.exports = routers;