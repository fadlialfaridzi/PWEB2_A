const Booking = require('../models/booking');

exports.showDaftarBookingPemilik = (req, res) => {
    const ownerId = req.session.user?.id;

    if (!ownerId || req.session.user.role !== 'pemilik') {
        return res.redirect('/login');
    }

    Booking.getBookingsForOwner(ownerId, (err, bookings) => {
        if (err) {
            console.error('Error fetching bookings for owner:', err);
            return res.status(500).send('Gagal mengambil data booking');
        }

        res.render('daftarBookingPemilik', {
            user: req.session.user,
            title: 'Daftar Booking Kos',
            bookings: bookings || [],
            successMessage: req.query.success || null // Tambahkan ini
        });
    });
};

// Controller untuk menandai booking sebagai complete
exports.completeBooking = (req, res) => {
    const bookingId = req.params.bookingId;
    const ownerId = req.session.user?.id;

    if (!ownerId || req.session.user.role !== 'pemilik') {
        return res.redirect('/login');
    }

    Booking.completeBooking(bookingId, (err, result) => {
        if (err) {
            console.error('Error completing booking:', err);
            return res.status(500).send('Gagal menandai booking sebagai complete');
        }

        res.redirect('/daftarBookingPemilik?success=Booking berhasil ditandai sebagai complete');
    });
};