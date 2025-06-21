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

            // Pastikan foto kos ada sebelum mengaksesnya
            const photos = kos.photos && kos.photos.length > 0 ? kos.photos : [];

            // Kirim data pengguna, kos, foto, fasilitas, dan tanggal booking ke halaman booking
            res.render('bookingPage', {
                title: 'Booking Kos',
                kos: kos,
                bookingDate: bookingDate,
                user: user,  // Kirim data user ke halaman booking
                fasilitas: fasilitas || [], // Kirim data fasilitas ke halaman booking
                photos: photos  // Kirim foto kos ke halaman booking (cek ada/tidaknya foto)
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

// Fungsi untuk menampilkan daftar booking kos oleh user yang sedang login
exports.showMyBookings = (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.redirect('/login');
    }

    // Ambil daftar booking kos berdasarkan userId
    Booking.getBookingsByUser(userId, (err, bookings) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).send('Gagal mengambil data booking');
        }

        // Ambil kos_id dari setiap booking
        const kosIds = bookings.map(booking => booking.kos_id);

        // Pastikan kosIds bukan array kosong sebelum memanggil getKosByIds
        if (kosIds.length === 0) {
            return res.render('myBookings', {
                user: req.session.user,  // Kirim data user ke view
                title: 'Daftar Booking Kos',
                bookings: [],  // Jika tidak ada booking, kirimkan array kosong
                kosDetails: [], // Kos detail kosong
                noBookingsMessage: 'Belum ada bookingan'  // Kirimkan pesan "Belum ada bookingan"
            });
        }

        // Ambil detail kos untuk setiap kos_id
        Kos.getKosByIds(kosIds, (err, kosDetails) => {
            if (err) {
                console.error('Error fetching kos details:', err);
                return res.status(500).send('Gagal mengambil detail kos');
            }

            console.log(kosDetails); // Debugging: Periksa apakah kosDetails berisi data yang benar

            // Gabungkan data booking dengan detail kos dan kirimkan ke halaman
            bookings.forEach((booking, index) => {
                booking.kos = kosDetails[index];
                booking.booking_date = booking.booking_date;  // Pastikan booking_date ada
            });

            // Log untuk memastikan data booking dan kos telah digabung dengan benar
            console.log(bookings);

            // Kirimkan foto kos ke view bersama detail kos
            const bookingsWithPhotos = bookings.map((booking, index) => {
                return {
                    ...booking,
                    kos: {
                        ...booking.kos,
                        photos: booking.kos.photos || [] // Pastikan foto kos ada
                    }
                };
            });

            // Render halaman myBookings dengan daftar kos yang dibooking
            res.render('myBookings', {
                user: req.session.user,  // Kirim data user ke view
                title: 'Daftar Booking Kos',
                bookings: bookingsWithPhotos,  // Kirim data booking yang sudah digabungkan dengan foto
                kosDetails: kosDetails
            });
        });
    });
};

