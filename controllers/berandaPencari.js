const Kos = require('../models/Kos');

// Menampilkan semua data kos hanya jika pengguna login sebagai pencari kos
const showAllKosForPencari = (req, res) => {
    // Memastikan pengguna sudah login dan memiliki role sebagai 'pencari'
    if (!req.session.user || req.session.user.role !== 'pencari') {
        return res.redirect('/login');
    }

    // Fetch semua data kos yang tersedia untuk pencari
    Kos.getAllAvailableKos((err, kos) => {
        if (err) {
            console.error('Error fetching kos:', err);
            return res.status(500).send('Gagal mengambil data kos');
        }

        // Fetch fasilitas untuk setiap kos
        const kosWithFacilitiesPromises = kos.map((kosItem) => {
            return new Promise((resolve, reject) => {
                Kos.getFasilitasKos(kosItem.id, (err, fasilitas) => {
                    if (err) {
                        console.error('Error fetching facilities for kos:', err);
                        reject(err);
                    } else {
                        const facilities = fasilitas || [];
                        kosItem.facilities = facilities.map(facility => facility.fasilitas);
                        resolve(kosItem);
                    }
                });
            });
        });

        Promise.all(kosWithFacilitiesPromises)
            .then(kosWithFacilities => {
                res.render('indexPencariKos', {
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
    showAllKosForPencari
};
