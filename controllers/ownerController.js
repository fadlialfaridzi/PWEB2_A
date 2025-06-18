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

    const { name, price, paymentType, address, facilities,latitude, longitude, description  } = req.body;
    const kosData = {
        user_id: userId,
        name,
        price,
        payment_type: paymentType,
        address,
        latitude,
        longitude,
        description
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

// Fungsi untuk menampilkan detail kos
const detailKos = (req, res) => {
    const kosId = req.params.id;

    // Ambil data kos dari database
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

            // Kirim data kos dan fasilitas ke view
            res.render('detailkos', {
                kos: kosItem, // kosItem sudah berisi kos dan photos
                fasilitas: fasilitas,
                user: req.session.user,
            });
        });
    });
};

// Fungsi untuk menambah foto carousel
const addPhotos = (req, res) => {
    const kosId = req.params.id;
    const files = req.files;

    if (files.length < 3) {
        return res.status(400).json({ success: false, message: 'Minimal 3 foto harus diunggah untuk carousel' });
    }

    files.forEach(file => {
        FotoKos.addFoto(kosId, file.filename, (err) => {
            if (err) {
                console.error('Gagal menyimpan foto:', err);
            }
        });
    });

    // Redirect kembali ke halaman detail kos setelah foto ditambahkan
    res.redirect(`/detailKos/${kosId}`);
};

module.exports = {
    ownerDashboard,
    tambahKos,
    updateKosStatus,
    detailKos,
    addPhotos
};
