const Kos = require('../models/Kos');
const FotoKos = require('../models/FotoKos');

// Menampilkan halaman dashboard pemilik kos
const ownerDashboard = (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) return res.redirect('/login');

    Kos.getAllWithFoto(userId, (err, kos) => {
        if (err) {
            console.error('Error fetching kos:', err);
            return res.status(500).send('Gagal mengambil data kos');
        }

        res.render('indexPemilikKos', { kos,
            user: req.session.user,
            success: req.query.success || null });
    });
};

const tambahKos = (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Tidak ada sesi user' });

    const { name, price, paymentType, address, facilities,latitude, longitude } = req.body;
    const kosData = {
        user_id: userId,
        name,
        price,
        payment_type: paymentType,
        address,
        latitude,
        longitude,
    };

    Kos.addKos(kosData, (err, result) => {
        if (err) {
            console.error('Gagal menambahkan kos:', err);
            return res.status(500).json({ success: false });
        }

        const kosId = result.insertId;

        // Menyimpan fasilitas ke database
        if (facilities && facilities.length > 0) {
            facilities.forEach(fasilitas => {
                Kos.addFasilitasKos(kosId, fasilitas, (err) => {
                    if (err) {
                        console.error('Gagal menyimpan fasilitas:', err);
                    }
                });
            });
        }
        const files = req.files;

        //menyimpan foto
        if (files && files.length > 0) {
            files.forEach(file => {
                FotoKos.addFoto(kosId, file.filename, (err) => {
                    if (err) {
                        console.error('Gagal menyimpan foto:', err);
                    }
                });
            });
        }
        res.redirect('/indexPemilikKos?success=true');
    });
};

// Fungsi untuk memperbarui status kos
const updateKosStatus = (req, res) => {
    const kosId = req.params.id;
    const status = req.body.status;  // 'available' or 'not_available'

    if (!status || (status !== 'available' && status !== 'not_available')) {
        return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    Kos.updateKosStatus(kosId, status, (err, result) => {
        if (err) {
            console.error('Error updating kos status:', err);
            return res.status(500).json({ success: false });
        }

        res.json({ success: true });
    });
};

module.exports = {
    ownerDashboard,
    tambahKos,
    updateKosStatus
};
