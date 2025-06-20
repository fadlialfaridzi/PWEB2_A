const Kos = require('../models/Kos');

// Menampilkan semua data kos tanpa login, hanya menampilkan card kos dengan status "available"
const showAllKos = (req, res) => {
    // Fetch all kos data without user login check
    Kos.getAllWithFoto(null, (err, kos) => {  // Passing null because we don't need to filter by user
        if (err) {
            console.error('Error fetching kos:', err);
            return res.status(500).send('Gagal mengambil data kos');
        }

        // Filter kos dengan status 'available'
        const availableKos = kos.filter(kosItem => kosItem.status === 'available');

        // Fetch facilities for each kos item
        const kosWithFacilitiesPromises = availableKos.map((kosItem) => {
            return new Promise((resolve, reject) => {
                Kos.getFasilitasKos(kosItem.id, (err, fasilitas) => {
                    if (err) {
                        console.error('Error fetching facilities for kos:', err);
                        reject(err); // Reject if there's an error fetching facilities
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
                res.render('index', {
                    title: 'Kosand',
                    kos: kosWithFacilities,
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
    showAllKos
};
