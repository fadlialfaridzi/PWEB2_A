const db = require('../config/db');  // Assuming db is your mysql connection

const Booking = {
    addBooking: (kosId, userId, bookingDate, callback) => {
        const query = `INSERT INTO bookings (kos_id, user_id, booking_date) VALUES (?, ?, ?)`;
        db.query(query, [kosId, userId, bookingDate], callback);
    },
    // Menghapus booking dari database
    deleteBooking: (kosId, userId, callback) => {
        const query = `DELETE FROM bookings WHERE kos_id = ? AND user_id = ?`;
        db.query(query, [kosId, userId], callback);
    }
};

module.exports = Booking;
