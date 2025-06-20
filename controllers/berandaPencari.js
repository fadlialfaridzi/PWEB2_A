const Kos = require('../models/Kos');

// Menampilkan semua data kos hanya jika pengguna login sebagai pencari kos
const showAllKosForPencari = (req, res) => {
    // Memastikan pengguna sudah login dan memiliki role sebagai 'pencari'
    if (!req.session.user || req.session.user.role !== 'pencari') {
        return res.redirect('/login'); // Arahkan ke halaman login jika tidak memiliki akses
    }

    // Fetch semua data kos dengan status 'available' untuk pencari
    Kos.getAllWithFoto(null, (err, kos) => {  // Passing null karena kita tidak perlu filter user
        if (err) {
            console.error('Error fetching kos:', err);
            return res.status(500).send('Gagal mengambil data kos');
        }

        // Filter kos dengan status 'available'
        const availableKos = kos.filter(kosItem => kosItem.status === 'available');

        // Fetch fasilitas untuk setiap kos
        const kosWithFacilitiesPromises = availableKos.map((kosItem) => {
            return new Promise((resolve, reject) => {
                Kos.getFasilitasKos(kosItem.id, (err, fasilitas) => {
                    if (err) {
                        console.error('Error fetching facilities for kos:', err);
                        reject(err);  // Reject jika ada error saat mengambil fasilitas
                    } else {
                        // Pastikan fasilitas tidak null atau undefined
                        const facilities = fasilitas || [];  // Default ke array kosong jika tidak ada fasilitas

                        // Menambahkan fasilitas ke objek kos
                        kosItem.facilities = facilities.map(facility => facility.fasilitas);

                        resolve(kosItem); // Resolve kosItem dengan fasilitas
                    }
                });
            });
        });

        // Setelah mengambil semua fasilitas, render halaman
        Promise.all(kosWithFacilitiesPromises)
            .then(kosWithFacilities => {
                // Kirim data kos dengan fasilitas ke view
                res.render('indexPencariKos', {
                    kos: kosWithFacilities,
                    user: req.session.user, // Mengirim data user untuk tampilan avatar dan dropdown
                    successMessage: req.query.success || null,
                    successEdit: req.query.successEdit || null,
                    successDelete: req.query.successDelete || null
                });
            })
            .catch(err => {
                console.error('Error fetching facilities for some kos:', err);
                res.status(500).send('Gagal mengambil fasilitas kos');
            });
    });
};

module.exports = {
    showAllKosForPencari
};
