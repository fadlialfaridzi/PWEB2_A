const Kos = require('../models/Kos');

exports.showHubungiPemilik = (req, res) => {
    const kosId = req.params.kosId;
    const userId = req.session.user?.id;

    if (!userId || req.session.user.role !== 'pencari') {
        return res.redirect('/login');
    }

    // Ambil detail kos untuk mendapatkan nama kos dan user_id pemilik
    Kos.getKosById(kosId, (err, kos) => {
        if (err) {
            console.error('Error fetching kos details:', err);
            return res.status(500).send('Gagal mengambil detail kos');
        }

        // Ambil informasi pemilik kos
        Kos.getOwnerInfo(kos.user_id, (err, ownerInfo) => {
            if (err) {
                console.error('Error fetching owner info:', err);
                return res.status(500).send('Gagal mengambil informasi pemilik');
            }

            // Ambil daftar kos yang dimiliki pemilik
            Kos.getKosByOwner(kos.user_id, (err, ownerKos) => {
                if (err) {
                    console.error('Error fetching owner kos:', err);
                    return res.status(500).send('Gagal mengambil daftar kos pemilik');
                }

                res.render('hubungiPemilik', {
                    user: req.session.user,
                    title: 'Hubungi Pemilik Kos',
                    ownerInfo: ownerInfo,
                    ownerKos: ownerKos,
                    kosName: kos.name,
                    kosId: kosId
                });
            });
        });
    });
};