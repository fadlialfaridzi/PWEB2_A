const Kos = require('../models/Kos');

exports.showHubungiPemilik = (req, res) => {
    const kosId = req.params.kosId;
    const userId = req.session.user?.id;

    if (!userId || req.session.user.role !== 'pencari') {
        return res.redirect('/login');
    }

    console.log('HubungiPemilik - kosId:', kosId);
    console.log('HubungiPemilik - userId:', userId);

    // Ambil detail kos untuk mendapatkan nama kos dan user_id pemilik
    Kos.getKosById(kosId, (err, kos) => {
        if (err) {
            console.error('Error fetching kos details:', err);
            return res.status(500).send('Gagal mengambil detail kos');
        }

        if (!kos) {
            return res.status(404).send('Kos tidak ditemukan');
        }

        console.log('HubungiPemilik - kos data:', kos);

        // Ambil informasi pemilik kos
        Kos.getOwnerInfo(kos.user_id, (err, ownerInfo) => {
            if (err) {
                console.error('Error fetching owner info:', err);
                return res.status(500).send('Gagal mengambil informasi pemilik');
            }

            console.log('HubungiPemilik - ownerInfo:', ownerInfo);

            // Ambil daftar kos yang dimiliki pemilik
            Kos.getKosByOwner(kos.user_id, (err, ownerKos) => {
                if (err) {
                    console.error('Error fetching owner kos:', err);
                    return res.status(500).send('Gagal mengambil daftar kos pemilik');
                }

                console.log('HubungiPemilik - ownerKos:', ownerKos);

                res.render('hubungiPemilik', {
                    user: req.session.user,
                    title: 'Hubungi Pemilik Kos',
                    ownerInfo: ownerInfo,
                    ownerKos: ownerKos || [],
                    kosName: kos.name,
                    kosId: kosId
                });
            });
        });
    });
};