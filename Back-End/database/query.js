const conexao = require('../config/db')

async function executeQuery(query, params = []){
    
    try{
        const [rows] = await conexao.query(query,params)
        return rows
    }
    catch(error){
        throw new Error(`Erro na execução da consulta ${error.message}`)
    }
};

module.exports = executeQuery 