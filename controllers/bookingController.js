const Booking = require('../models/booking');
const Kos = require('../models/Kos');
const Rating = require('../models/rating');

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

    // Ambil daftar booking kos berdasarkan userId (yang belum complete)
    Booking.getBookingsByUser(userId, (err, bookings) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).send('Gagal mengambil data booking');
        }

        // Ambil kos_id dari setiap booking
        const kosIds = bookings.map(booking => booking.kos_id);

        if (kosIds.length === 0) {
            return res.render('myBookings', {
                user: req.session.user,
                title: 'Daftar Booking Kos',
                bookings: [],
                kosDetails: [],
                noBookingsMessage: 'Saat ini tidak ada bookingan yang aktif. Semua bookingan Anda sudah selesai atau belum ada bookingan.',
                successMessage: req.query.success || null
            });
        }

        // Ambil detail kos untuk setiap kos_id
        Kos.getKosByIds(kosIds, (err, kosDetails) => {
            if (err) {
                console.error('Error fetching kos details:', err);
                return res.status(500).send('Gagal mengambil detail kos');
            }

            // Buat mapping kos berdasarkan ID
            const kosMap = {};
            kosDetails.forEach(kos => {
                kosMap[kos.id] = kos;
            });

            // Gabungkan data booking dengan detail kos
            const bookingsWithKosDetails = bookings.map(booking => {
                const kosDetail = kosMap[booking.kos_id];
                return {
                    ...booking,
                    kos: kosDetail || null
                };
            });

            res.render('myBookings', {
                user: req.session.user,
                title: 'Daftar Booking Kos',
                bookings: bookingsWithKosDetails,
                kosDetails: bookingsWithKosDetails,
                noBookingsMessage: null,
                successMessage: req.query.success || null
            });
        });
    });
};

// Fungsi untuk menampilkan halaman rating
exports.showRatingPage = (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.redirect('/login');
    }

    // Ambil data booking yang sudah complete
    Booking.getCompletedBookingsByUser(userId, (err, completedBookings) => {
        if (err) {
            console.error('Error fetching completed bookings:', err);
            return res.status(500).send('Gagal mengambil data booking');
        }

        res.render('ratingPage', {
            user: req.session.user,
            title: 'Rating Kos',
            completedBookings: completedBookings || [],
            successMessage: req.query.success || null
        });
    });
};

// Fungsi untuk menyimpan rating
exports.saveRating = (req, res) => {
    const { bookingId, kosId, rating, review } = req.body;
    const userId = req.session.user?.id;

    console.log('Rating data received:', { bookingId, kosId, rating, review, userId });

    if (!userId) {
        return res.redirect('/login');
    }

    // Validasi data yang diperlukan
    if (!bookingId || !kosId || !rating) {
        console.error('Missing required data:', { bookingId, kosId, rating });
        return res.status(400).send('Data rating tidak lengkap');
    }

    // Validasi rating harus antara 1-5
    if (rating < 1 || rating > 5) {
        console.error('Invalid rating value:', rating);
        return res.status(400).send('Rating harus antara 1-5');
    }

    // Cek apakah sudah ada rating untuk booking ini
    Rating.getRatingByBookingId(bookingId, (err, existingRating) => {
        if (err) {
            console.error('Error checking existing rating:', err);
            return res.status(500).send('Gagal menyimpan rating');
        }

        console.log('Existing rating check result:', existingRating);

        if (existingRating && existingRating.length > 0) {
            // Update rating yang sudah ada
            Rating.updateRating(bookingId, rating, review, (err, result) => {
                if (err) {
                    console.error('Error updating rating:', err);
                    return res.status(500).send('Gagal mengupdate rating');
                }
                console.log('Rating updated successfully:', result);
                res.redirect('/ratingPage?success=Rating berhasil diupdate');
            });
        } else {
            // Tambah rating baru
            Rating.addRating(bookingId, userId, kosId, rating, review, (err, result) => {
                if (err) {
                    console.error('Error adding rating:', err);
                    return res.status(500).send('Gagal menyimpan rating');
                }
                console.log('Rating added successfully:', result);
                res.redirect('/ratingPage?success=Rating berhasil disimpan');
            });
        }
    });
};
