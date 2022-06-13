const mysql = require("mysql");

exports.createCon = ()=>{
    var con = mysql.createConnection({
        host: 'localhost',
        user: 'torres',
        password: 'pass123456',
        database: 'travelexperts'
    });
    con.connect();
    return con;
};