const Booking = require('../models/booking');

exports.showDaftarBookingPemilik = (req, res) => {
    const ownerId = req.session.user?.id;

    if (!ownerId || req.session.user.role !== 'pemilik') {
        return res.redirect('/login');
    }

    // Ambil daftar booking untuk pemilik kos
    Booking.getBookingsForOwner(ownerId, (err, bookings) => {
        if (err) {
            console.error('Error fetching bookings for owner:', err);
            return res.status(500).send('Gagal mengambil data booking');
        }

        res.render('daftarBookingPemilik', {
            user: req.session.user,
            title: 'Daftar Booking Kos',
            bookings: bookings || []
        });
    });
};