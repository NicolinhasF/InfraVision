const express = require('express');
const conexao = require('../config/db');
const cors = require('cors');
const routers = require('../src/routers');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', routers);
app.use(routers);

const PORT = process.env.PORT || 3001

conexao.query("select 1")
.then(() =>{
    console.log("conectado com sucesso")
    app.listen(PORT, function(){
        console.log("Servidor executando na url:http://localhost:3001")
    });
})

.catch(erro => console.error("Falha na conexão com o banco:", erro.message));