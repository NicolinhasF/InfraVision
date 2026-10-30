const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const requiredVariables = ['DB_HOST', 'DB_USER'];
const missingVariables = requiredVariables.filter(variable => !process.env[variable]);

if (process.env.DB_PASSWORD === undefined) {
    missingVariables.push('DB_PASSWORD');
}

if (missingVariables.length > 0) {
    throw new Error(`Missing database configuration: ${missingVariables.join(', ')}. Set these values in Back-End/.env.`);
}

const cliente = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'infravision1'
});

module.exports = cliente;
