const bcrypt = require("bcrypt");
const hashedPassword = await bcrypt.hash(password, 10);

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password1",
    database: "user_cred"
});

db.connect((err) => {
    if (err) {
        console.log("Connection failed:", err);
    } else {
        console.log("Connected to MySQL!");
    }
});

module.exports = db;