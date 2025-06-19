const mysql = require('mysql2');

// Create a connection to the database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kosand'
});

const db = pool.promise();

// Register new user
async function registerUser(name, email, phone, password, role) {
  const [rows, fields] = await db.execute(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, password, role]
  );
  return rows;
}

// Find user by email
async function findUserByEmail(email) {
  const [rows, fields] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

module.exports = {
  registerUser,
  findUserByEmail
};



