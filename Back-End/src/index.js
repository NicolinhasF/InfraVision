const express = require('express');
const conexao = require('../config/db');
const cors = require('cors');
const routers = require('../src/routers');

require('dotenv').config();

const app = express(); // api utilize o express

app.use(express.json()); // use o modo json
app.use(cors());// necessario para habilitar comunicação com servidor 
app.use('/api', routers);
app.use(routers); //utilize as totas

const PORT = process.env.PORT || 3001

conexao.query("select 1") //selecione uma conexão
.then(() =>{
    console.log("conectado com sucesso") //se foi sucesso imprima:
    app.listen(PORT, function(){ //conexão na porta, fique online na porta
        console.log("Servidor executando na url:http://localhost:3001")
    });
})

.catch(erro => console.log("Falha na conexão")); //se der erro