//The library to connect to postgre sql
const { Client } = require('pg');

//The configuration of the environment variables.
require('dotenv').config({"path" : "./../.env"});

//Getting the connection string from .env file
var connectionString = process.env.CONNECTION_STRING;

//The function which helps to connect to the database
async function getConnection()
{
    var connection = new Client({
        "connectionString" : connectionString
    });
    connection.connect();
    return connection;
}

//The exports are defined so as to use them from everywhere
module.exports = { getConnection };