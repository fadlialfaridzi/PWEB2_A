var express = require('express');
var router = express.Router();
const upload = require('../config/upload');
const ownerController = require('../controllers/ownerController'); // Pastikan path ke controller benar

// route  untuk menampilkan form tambah kos
router.get('/formTambahKos', (req, res) => {
    if (req.session.user && req.session.user.role === 'pemilik') {
        res.render('formTambahKos', { user: req.session.user, title: 'Form Tambah Kos' });
    } else {
        res.redirect('/login');
    }
});

// Routes for role-based page rendering
router.get('/indexpencarikos', (req, res) => {
    if (req.session.user && req.session.user.role === 'pencari') {
        res.render('indexpencarikos', { user: req.session.user, title: 'Index Pencari Kos' });
    } else {
        res.redirect('/login');
    }
});

// Route untuk menampilkan halaman pemilik kos
router.get('/indexpemilikkos', (req, res) => {
    if (req.session.user && req.session.user.role === 'pemilik') {
        // Mengambil kos yang dimiliki pemilik berdasarkan user_id
        ownerController.ownerDashboard(req, res);  // Memanggil controller untuk menghandle data kos
        // res.render('indexpemilikkos', {user:req.session.user, title: 'Index Pemilik Kos'});
    } else {
        res.redirect('/login');
    }
});

/* GET beranda / index page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home - Kosand' });
});

/* GET role page. */
router.get('/role', function(req, res, next) {
  res.render('role', { title: 'Register - Kosand' });
});

/* GET role page for Owner Dashboard */
router.get('/indexPemilikKos', ownerController.ownerDashboard);  // Mengarahkan ke controller ownerDashboard
router.post('/tambahKos', upload.array('photos'), ownerController.tambahKos);
// Route untuk memperbarui status kos (tombol)
router.post('/kos/:id/status', ownerController.updateKosStatus);
// Route untuk halaman detail kos
router.get('/detailKos/:id', ownerController.detailKos);
// Route untuk menambah foto ke detail kos
router.post('/detailKos/:id/addPhotos', upload.array('photos'), ownerController.addPhotos);

// Route untuk menampilkan halaman edit kos
router.get('/editKos/:id', ownerController.editKos);

// Route untuk memperbarui data kos
router.post('/editKos/:id', upload.array('photos'), ownerController.updateKos);
// Route untuk menghapus kos
router.post('/hapusKos/:id', ownerController.hapusKos);
//logout
// Route untuk logout
router.get('/logout', (req, res) => {
    // Hapus data session user
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Gagal logout");
        }
        // Redirect ke halaman index setelah logout
        res.redirect('/');
    });
});



module.exports = router;
