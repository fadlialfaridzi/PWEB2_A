const db = require('../config/db');  // Assuming db is your mysql connection

const Booking = {
    addBooking: (kosId, userId, bookingDate, callback) => {
        const query = `INSERT INTO bookings (kos_id, user_id, booking_date, status) VALUES (?, ?, ?, 'pending')`;
        db.query(query, [kosId, userId, bookingDate], callback);
    },
    // Menghapus booking dari database (hanya yang pending)
    deleteBooking: (kosId, userId, callback) => {
        const query = `DELETE FROM bookings WHERE kos_id = ? AND user_id = ? AND (status = 'pending' OR status IS NULL)`;
        db.query(query, [kosId, userId], callback);
    },
    // Mengambil daftar booking berdasarkan userId (hanya yang pending)
    getBookingsByUser: (userId, callback) => {
        const query = `
            SELECT * FROM bookings 
            WHERE user_id = ? AND (status = 'pending' OR status IS NULL)
            ORDER BY booking_date DESC
        `;
        db.query(query, [userId], callback);
    },
    // Mengambil daftar booking untuk pemilik kos (semua status)
    getBookingsForOwner: (ownerId, callback) => {
        const query = `
            SELECT 
                b.id,
                b.booking_date,
                b.kos_id,
                b.status,
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
    },
    // Update status booking menjadi complete
    completeBooking: (bookingId, callback) => {
        const query = `UPDATE bookings SET status = 'complete' WHERE id = ?`;
        db.query(query, [bookingId], callback);
    },
    // Update bookingan lama yang belum memiliki status menjadi pending
    updateOldBookingsStatus: (callback) => {
        const query = `UPDATE bookings SET status = 'pending' WHERE status IS NULL`;
        db.query(query, callback);
    },
    // Ambil booking yang sudah complete untuk rating
    getCompletedBookingsByUser: (userId, callback) => {
        const query = `
            SELECT 
                b.id as booking_id,
                b.booking_date,
                b.kos_id,
                k.name as kos_name,
                k.price as kos_price,
                k.address as kos_address,
                r.rating,
                r.review
            FROM bookings b
            JOIN kos k ON b.kos_id = k.id
            LEFT JOIN ratings r ON b.id = r.booking_id
            WHERE b.user_id = ? AND b.status = 'complete'
            ORDER BY b.booking_date DESC
        `;
        db.query(query, [userId], callback);
    }
};

module.exports = Booking;
