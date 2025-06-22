const db = require('../db');

// Ambil semua review milik owner tertentu
exports.getReviewsByOwnerId = (ownerId, callback) => {
  const sql = 'SELECT * FROM reviews WHERE ownerId = ?';
  db.query(sql, [ownerId], callback);
};

// Balas review
exports.replyToReview = (reviewId, replyText, callback) => {
  const sql = 'UPDATE reviews SET reply = ? WHERE id = ?';
  db.query(sql, [replyText, reviewId], callback);
};

// Tambah dummy review (untuk dev/test)
exports.addDummyReview = (callback) => {
  const sql = `
    INSERT INTO reviews (reviewerName, content, rating, ownerId)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, ['Mahasiswa Uda', 'Kosan bersih dan nyaman', 5, 1], callback); // ownerId = 1 bisa kamu ubah
};
