const mysql = require("mysql");

const db = mysql.createConnection({
    host : "127.0.0.1",
    user : "root",
    password : "",
    database : "zuper"
});

/**
 * To create a DB connection
 * for simplicity only connection is made and the connection is not terminated
 */
db.connect((err) => {
    if(err) throw err;

    console.log("DB Connected...");
});

module.exports = {db};