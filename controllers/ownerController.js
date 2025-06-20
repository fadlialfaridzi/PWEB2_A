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
            success: req.query.success || null ,
            successEdit: req.query.successEdit || null,
            successDelete: req.query.successDelete || null
        });
    });
};

const tambahKos = (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');
    

    const { name, price, paymentType, address, facilities,latitude, longitude, description, status, tipe_kos  } = req.body;
    const statusKos = status || 'available';
    const kosData = {
        user_id: userId,
        name,
        price,
        payment_type: paymentType,
        address,
        latitude,
        longitude,
        description,
        status: statusKos,
        tipe_kos
    };

    Kos.addKos(kosData, (err, result) => {
        const userId = req.session.user?.id;
        if (!userId) return res.redirect('/login');

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

const editKos = (req, res) => {
    const kosId = req.params.id;
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');

    // Ambil data kos dari database
    Kos.getKosById(kosId, (err, kosItem) => {
        if (err) {
            console.error('Error fetching kos details for editing:', err);
            return res.status(500).send('Gagal mengambil data kos untuk edit');
        }

        // Ambil fasilitas kos dari database
        Kos.getFasilitasKos(kosId, (err, fasilitas) => {
            if (err) {
                console.error('Error fetching facilities:', err);
                return res.status(500).send('Gagal mengambil fasilitas kos');
            }

            // Pastikan fasilitas tidak null atau undefined
            const facilities = fasilitas || [];  // Default ke array kosong jika tidak ada fasilitas

            // Kirim data kos dan fasilitas ke view
            res.render('editKos', {
                kos: { ...kosItem, facilities: facilities },  // Menambahkan fasilitas ke objek kos
                user: req.session.user
            });
        });
    });
};

// Fungsi untuk memperbarui status kos
const updateKosStatus = (req, res) => {
    const kosId = req.params.id;
    let status = req.body.status;  // 'available' or 'not_available'
    const userId = req.session.user?.id;
    let newStatus;

    if (status == 'available') {
        newStatus = 'not_available'
    } else if( status == 'not_available'){
       newStatus = 'available'
    }

    if (!userId) return res.redirect('/login');

    if (!status || (status !== 'available' && status !== 'not_available')) {
        return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    Kos.updateKosStatus(kosId, newStatus, (err, result) => {
        if (err) {
            console.error('Error updating kos status:', err);
            return res.status(500).json({ success: false });
        }

    });
    // res.json({
    //     kosId,
    //     status,
    //     userId,
    //     newStatus
    // })
    ownerDashboard(req, res)
};

// Fungsi untuk menghapus kos
const hapusKos = (req, res) => {
    const kosId = req.params.id;
    const userId = req.session.user?.id;

    if (!userId) return res.redirect('/login'); // Pastikan user sudah login

    // Hapus foto terkait kos jika ada
    FotoKos.deleteFotoByKosId(kosId, (err) => {
        if (err) {
            console.error('Error deleting photos:', err);
            return res.status(500).send('Gagal menghapus foto');
        }

        // Hapus fasilitas terkait kos
        Kos.deleteFasilitasKos(kosId, (err) => {
            if (err) {
                console.error('Error deleting facilities:', err);
                return res.status(500).send('Gagal menghapus fasilitas');
            }

            // Hapus kos dari database
            Kos.deleteKos(kosId, (err, result) => {
                if (err) {
                    console.error('Error deleting kos:', err);
                    return res.status(500).send('Gagal menghapus kos');
                }
                // Redirect ke halaman indexPemilikKos dengan pesan sukses
                res.redirect('/indexPemilikKos?successDelete=true');
            });
        });
    });
};

const updateKos = (req, res) => {
    const kosId = req.params.id;
    const { name, price, paymentType, address, latitude, longitude, description, facilities } = req.body;
    const photos = req.files; // Foto yang di-upload
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login'); // Pengecekan userId

    const kosData = {
        name,
        price,
        payment_type: paymentType,
        address,
        latitude,
        longitude,
        description
    };

    // Perbarui data kos di database
    Kos.updateKos(kosId, kosData, (err, result) => {
        if (err) {
            console.error('Error updating kos:', err);
            return res.status(500).send('Gagal memperbarui data kos');
        }

        // Menghapus fasilitas lama dan menambahkan fasilitas baru
        if (facilities && facilities.length > 0) {
            // Hapus fasilitas lama
            Kos.deleteFasilitasKos(kosId, (err) => {
                if (err) {
                    console.error('Error deleting old facilities:', err);
                }
                // Menambahkan fasilitas baru
                facilities.forEach(fasilitas => {
                    Kos.addFasilitasKos(kosId, fasilitas, (err) => {
                        if (err) {
                            console.error('Error adding new facility:', err);
                        }
                    });
                });
            });
        }

        // Jika ada foto baru yang di-upload, simpan foto tersebut
        if (photos && photos.length > 0) {
            photos.forEach(file => {
                FotoKos.addFoto(kosId, file.filename, (err) => {
                    if (err) {
                        console.error('Error adding new photo:', err);
                    }
                });
            });
        }

        // Redirect ke halaman indexPemilikKos dengan pesan sukses
        res.redirect('/indexPemilikKos?successEdit=true');
    });
};

// Fungsi untuk menampilkan detail kos
const detailKos = (req, res) => {
    const kosId = req.params.id;
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');

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
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');

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
    addPhotos,
    editKos,
    updateKos,
    hapusKos
};
