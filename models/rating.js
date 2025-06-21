const db = require('../config/db');

const Rating = {
    addRating: (bookingId, userId, kosId, rating, review, callback) => {
        const query = `INSERT INTO ratings (booking_id, user_id, kos_id, rating, review) VALUES (?, ?, ?, ?, ?)`;
        db.query(query, [bookingId, userId, kosId, rating, review], callback);
    },
    
    getRatingByBookingId: (bookingId, callback) => {
        const query = `SELECT * FROM ratings WHERE booking_id = ?`;
        db.query(query, [bookingId], callback);
    },
    
    updateRating: (bookingId, rating, review, callback) => {
        const query = `UPDATE ratings SET rating = ?, review = ? WHERE booking_id = ?`;
        db.query(query, [rating, review, bookingId], callback);
    }
};

module.exports = Rating;