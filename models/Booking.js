const db = require('../db');

// Ambil semua booking milik owner tertentu
exports.getBookingsByOwnerId = (ownerId, callback) => {
  const sql = 'SELECT * FROM bookings WHERE ownerId = ?';
  db.query(sql, [ownerId], callback);
};

// Ambil detail 1 booking
exports.getBookingById = (id, callback) => {
  const sql = 'SELECT * FROM bookings WHERE id = ?';
  db.query(sql, [id], callback);
};

// Update status booking
exports.updateBookingStatus = (id, status, callback) => {
  const sql = 'UPDATE bookings SET status = ? WHERE id = ?';
  db.query(sql, [status, id], callback);
};
