const Kos = require('../models/Kos');

// Menampilkan detail kos untuk pencarikos
const showDetailKosPencari = (req, res) => {
    const kosId = req.params.id;  // Ambil id kos dari parameter URL

    // Ambil data kos dari database berdasarkan kosId
    Kos.getKosById(kosId, (err, kosItem) => {
        if (err) {
            console.error('Error fetching kos details:', err);
            return res.status(500).send('Gagal mengambil detail kos');
        }

        // Ambil fasilitas kos dari database
        Kos.getFasilitasKos(kosId, (err, fasilitas) => {
            if (err) {
                console.error('Error fetching facilities:', err);
                return res.status(500).send('Gagal mengambil fasilitas kos');
            }

            // Check for success message in the session or query parameters (if needed)
            const successMessage = req.query.successMessage || '';  // Example: you could pass a success message via query parameters

            // Kirim data kos, fasilitas, dan successMessage ke view detailKosPencari
            res.render('detailKosPencari', {
                title: 'Detail Kos',
                user: req.session.user,
                kos: kosItem,
                facilities: fasilitas || [],
                successMessage: successMessage,  // Pass the success message
            });
        });
    });
};

module.exports = {
    showDetailKosPencari,
};
