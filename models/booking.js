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
    },
    // Mengambil daftar booking berdasarkan userId
    getBookingsByUser: (userId, callback) => {
        const query = `
            SELECT * FROM bookings WHERE user_id = ?
        `;
        db.query(query, [userId], callback);
    },
    // Mengambil daftar booking untuk pemilik kos
    getBookingsForOwner: (ownerId, callback) => {
        const query = `
            SELECT 
                b.id,
                b.booking_date,
                b.kos_id,
                k.name as kos_name,
                k.price as kos_price,
                k.payment_type as kos_payment_type,
                k.address as kos_address,
                u.name as user_name,
                u.phone as user_phone,
                u.email as user_email
            FROM bookings b
            JOIN kos k ON b.kos_id = k.id
            JOIN users u ON b.user_id = u.id
            WHERE k.user_id = ?
            ORDER BY b.booking_date DESC
        `;
        db.query(query, [ownerId], callback);
    }
};



module.exports = Booking;
