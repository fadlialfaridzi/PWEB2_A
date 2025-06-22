const mysql = require('mysql2');

// Membuat connection pool untuk performa yang lebih baik
const db = mysql.createPool({
    host: 'localhost',       // Ganti dengan host database Anda (misalnya 'localhost')
    user: 'root',            // Ganti dengan username MySQL Anda
    password: '',            // Ganti dengan password MySQL Anda
    database: 'kosand',      // Ganti dengan nama database Anda
    connectionLimit: 10,     // Jumlah maksimal koneksi dalam pool
    queueLimit: 0            // Tidak ada batasan antrian
});

// Test koneksi
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database with connection pool');
        connection.release();
    }
});

module.exports = db;
