const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // default user MySQL
  password: '',         // kosong jika XAMPP, isi jika pakai password
  database: 'kosand_db',   // pastikan ini sesuai dengan nama database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
