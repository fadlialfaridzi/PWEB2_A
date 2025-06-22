const Kos = require('../models/Kos');

// Menampilkan semua data kos tanpa login, hanya menampilkan card kos dengan status "available"
const showAllKos = (req, res) => {
    // Fetch semua data kos beserta rating
    Kos.getAllWithRating((err, kos) => {
        if (err) {
            console.error('Error fetching kos:', err);
            return res.status(500).send('Gagal mengambil data kos');
        }

        // Fetch facilities for each kos item
        const kosWithFacilitiesPromises = kos.map((kosItem) => {
            return new Promise((resolve, reject) => {
                Kos.getFasilitasKos(kosItem.id, (err, fasilitas) => {
                    if (err) {
                        console.error('Error fetching facilities for kos:', err);
                        reject(err);
                    } else {
                        const facilities = fasilitas || [];
                        kosItem.facilities = facilities.map(facility => facility.fasilitas);
                        // Ensure photos is always an array
                        kosItem.photos = kosItem.photos || [];
                        // Ensure rating data is properly formatted
                        kosItem.avg_rating = parseFloat(kosItem.average_rating || 0).toFixed(1);
                        kosItem.total_ratings = parseInt(kosItem.total_ratings || 0);
                        resolve(kosItem);
                    }
                });
            });
        });

        Promise.all(kosWithFacilitiesPromises)
            .then(kosWithFacilities => {
                res.render('index', {
                    title: 'Kosand',
                    kos: kosWithFacilities,
                    user: req.session.user
                });
            })
            .catch(err => {
                console.error('Error fetching facilities for some kos:', err);
                res.status(500).send('Gagal mengambil fasilitas kos');
            });
    });
};

// Fungsi untuk pemilik (terpisah)
const showOwnerKos = (req, res) => {
    // Pastikan user sudah login dan memiliki role sebagai 'pemilik'
    if (!req.session.user || req.session.user.role !== 'pemilik') {
        return res.redirect('/login');
    }

    const ownerId = req.session.user.id;

    // Fetch kos data berdasarkan ownerId (pemilik yang login)
    Kos.getAllWithFoto(ownerId, (err, kos) => {
        if (err) {
            console.error('Error fetching kos:', err);
            return res.status(500).send('Gagal mengambil data kos');
        }

        // Tampilkan semua kos milik pemilik
        const allKos = kos;

        // Fetch facilities for each kos item
        const kosWithFacilitiesPromises = allKos.map((kosItem) => {
            return new Promise((resolve, reject) => {
                Kos.getFasilitasKos(kosItem.id, (err, fasilitas) => {
                    if (err) {
                        console.error('Error fetching facilities for kos:', err);
                        reject(err);
                    } else {
                        const facilities = fasilitas || [];
                        kosItem.facilities = facilities.map(facility => facility.fasilitas);
                        // Ensure photos is always an array
                        kosItem.photos = kosItem.photos || [];
                        resolve(kosItem);
                    }
                });
            });
        });

        Promise.all(kosWithFacilitiesPromises)
            .then(kosWithFacilities => {
                res.render('indexPemilikKos', {
                    title: 'Kosand',
                    kos: kosWithFacilities,
                    user: req.session.user,
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
    showAllKos,
    showOwnerKos
};
