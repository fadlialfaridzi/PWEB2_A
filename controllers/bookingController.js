const Booking = require('../models/booking');
const Kos = require('../models/Kos');

// GET route untuk menampilkan halaman booking
exports.showBookingPage = (req, res) => {
    const kosId = req.params.kosId;
    const bookingDate = req.query.bookingDate;

    // Pastikan ada tanggal yang dipilih
    if (!bookingDate) {
        return res.status(400).send('Tanggal booking tidak valid.');
    }

    const userId = req.session.user?.id;

    // Ambil detail kos berdasarkan kosId
    Kos.getKosById(kosId, (err, kos) => {
        if (err) {
            console.error('Error fetching kos details:', err);
            return res.status(500).send('Gagal mengambil detail kos');
        }

        // Ambil foto kos
        Kos.getFasilitasKos(kosId, (err, fasilitas) => {
            if (err) {
                console.error('Error fetching fasilitas:', err);
                return res.status(500).send('Gagal mengambil fasilitas kos');
            }

            // Ambil data pengguna dari session
            const user = req.session.user;

            // Kirim data pengguna, kos, foto, fasilitas, dan tanggal booking ke halaman booking
            res.render('bookingPage', {
                title: 'Booking Kos',
                kos: kos,
                bookingDate: bookingDate,
                user: user,  // Kirim data user ke halaman booking
                fasilitas: fasilitas || [], // Kirim data fasilitas ke halaman booking
                photos: kos.photos || []  // Kirim foto kos ke halaman booking
            });
        });
    });
};

// POST route untuk menyimpan data booking
exports.createBooking = (req, res) => {
    const { kosId, bookingDate } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
        return res.redirect('/login');
    }

    // Simpan data booking ke database
    Booking.addBooking(kosId, userId, bookingDate, (err, result) => {
        if (err) {
            console.error('Error saving booking:', err);
            return res.status(500).send('Gagal memesan kos');
        }

        // Redirect ke halaman detail kos dengan pesan sukses
        const successMessage = 'Booking Success'; // Pesan sukses
        res.redirect(`/detailkospencari/${kosId}?successMessage=${encodeURIComponent(successMessage)}`);
    });
};

// GET route untuk menampilkan halaman detail kos dan pesan sukses
exports.showKosDetail = (req, res) => {
    const kosId = req.params.kosId;
    const successMessage = req.query.successMessage; // Ambil pesan sukses dari query parameter

    // Ambil detail kos berdasarkan kosId
    Kos.getKosById(kosId, (err, kos) => {
        if (err) {
            console.error('Error fetching kos details:', err);
            return res.status(500).send('Gagal mengambil detail kos');
        }

        // Render halaman detail kos dengan data kos dan pesan sukses jika ada
        res.render('detailPencariKos', {
            title: 'Detail Kos',
            kos: kos,
            successMessage: successMessage  // Kirim pesan sukses ke view
        });
    });
};

// Fungsi untuk membatalkan pesanan
exports.cancelBooking = (req, res) => {
    const kosId = req.body.kosId;
    const userId = req.session.user?.id;

    if (!userId) {
        return res.redirect('/login');
    }

    // Hapus data booking dari database
    Booking.deleteBooking(kosId, userId, (err, result) => {
        if (err) {
            console.error('Error cancelling booking:', err);
            return res.status(500).send('Gagal membatalkan pesanan');
        }

        // Redirect ke halaman detail kos setelah pesanan dibatalkan tanpa pesan sukses
        res.redirect(`/detailkospencari/${kosId}`);
    });
};

