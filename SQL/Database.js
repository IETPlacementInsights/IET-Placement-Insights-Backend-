var mysql = require('mysql2');
require('dotenv').config({"path" : "./../.env"});
var file = require('fs').promises;
var encrypter = require('./../utilities/Encryption');
var userName = process.env.DATABASE_USER_NAME;
var password = process.env.DATABASE_PASSWORD;
var databaseName = process.env.DATABASE_NAME;
var host = process.env.DATABASE_HOST;
async function readFile(name)
{
    try
    {
        var data = await file.readFile(name, 'utf-8');
        return data;
    }
    catch(err)
    {
        console.log(err);
    }
}
var connection = mysql.createConnection({
    "user" : userName,
    "password" : password,
    "host" : host
});
async function runQuery()
{
    connection.connect(function(error)
    {
        if(error)
        {
            console.log("Cannot connect to the Mysql");
            return;
        }
        else
        {
            console.log("Connected to the Mysql");
        }
    });

    var query = `create database ${databaseName}`;
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log(`Cannot create database ${databaseName}`);
            return;
        }
        else
        {
            console.log(`Created database ${databaseName}`);
        }
    });
    connection.changeUser({"database" : `${databaseName}`}, function(error)
    {
        if(error)
        {
            console.log(`Cannot use database ${databaseName}`);
            return;
        }
        else
        {
            console.log(`Using database ${databaseName}`);
        }
    });
    query = await readFile("Author.sql");
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log(error);

            console.log("Cannot create table author");
        }
        else
        {
            console.log("Created table author");
        }
    });
    query = await readFile("CompanyRequest.sql");
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log("Cannot create table company_request");
        }
        else
        {
            console.log("Created table company_request");
        }
    });
    query = await readFile("Company.sql");
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log(error);
            console.log("Cannot create table company");
        }
        else
        {
            console.log("Created table company");
        }
    });
    query = `insert into company (name) values ('General Blogs')`;
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log("Cannot add a company");
        }
        else
        {
            console.log("Added a company");
        }
    });
    query = await readFile("BlogRequest.sql");
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log("Cannot create table blog_request");
        }
        else
        {
            console.log("Created table blog_request");
        }
    });
    query = await readFile("Blog.sql");
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log("Cannot create table blog");
        }
        else
        {
            console.log("Created table blog");
        }
    });
    query = await readFile("User.sql");
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log("Cannot create table user");
        }
        else
        {
            console.log("Created table user");
        }
    });
    var adminEmail = process.env.ADMIN_EMAIL;
    var adminPassword = await encrypter.encryptPassword(process.env.ADMIN_PASSWORD);
    var adminName = process.env.ADMIN_NAME;

    query = `insert into user (email,password,name,role) values ('${adminEmail}', '${adminPassword}', '${adminName}', 'admin')`;
    connection.query(query,function(error,result)
    {
        if(error)
        {
            console.log("Cannot create an admin");
        }
        else
        {
            console.log("Created an admin");
        }
    });
    connection.end(function(error)
    {
        if(error)
        {
            console.log("Cannot terminate connection to the Mysql");
        }
        else
        {
            console.log("Connection to the Mysql is terminated");
        }
    });
}
runQuery();
