const mysql = require('mysql2');

// Membuat koneksi ke database
const db = mysql.createConnection({
    host: 'localhost',       // Ganti dengan host database Anda (misalnya 'localhost')
    user: 'root',            // Ganti dengan username MySQL Anda
    password: '',            // Ganti dengan password MySQL Anda
    database: 'kosand'    // Ganti dengan nama database Anda
});

// Koneksi ke database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database');
    }
});

module.exports = db;
