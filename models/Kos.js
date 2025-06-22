const db = require('../db');

// Ambil semua kos milik pemilik tertentu
exports.getKosByOwnerId = (ownerId, callback) => {
  const sql = 'SELECT * FROM kos WHERE pemilikId = ?';
  db.query(sql, [ownerId], callback);
};

// Update lokasi kos
exports.updateKosLocation = (kosId, alamatBaru, callback) => {
  const sql = 'UPDATE kos SET alamat = ? WHERE id = ?';
  db.query(sql, [alamatBaru, kosId], callback);
};

// Toggle ketersediaan kos
exports.toggleAvailability = (kosId, tersedia, callback) => {
  const sql = 'UPDATE kos SET tersedia = ? WHERE id = ?';
  db.query(sql, [tersedia, kosId], callback);
};
