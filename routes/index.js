var express = require('express');
var router = express.Router();
const upload = require('../config/upload');
const ownerController = require('../controllers/ownerController'); // 
const berandaController = require('../controllers/berandaController')
const detailKosPencari = require('../controllers/detailKosPencari')
const berandaPencari = require('../controllers/berandaPencari')
const mapController = require('../controllers/mapController')
const bookingController = require('../controllers/bookingController');
const hubungiPemilikController = require('../controllers/hubungiPemilikController');
const daftarBookingPemilikController = require('../controllers/daftarBookingPemilikController');
// route  untuk menampilkan form tambah kos
router.get('/formTambahKos', (req, res) => {
    if (req.session.user && req.session.user.role === 'pemilik') {
        res.render('formTambahKos', { user: req.session.user, title: 'Form Tambah Kos' });
    } else {
        res.redirect('/login');
    }
});

router.get('/indexPencariKos', (req, res) => {
    // Cek apakah pengguna sudah login dan memiliki role 'pencari'
    if (req.session.user && req.session.user.role === 'pencari') {
        // Jika sudah login sebagai pencari, tampilkan daftar kos
        berandaPencari.showAllKosForPencari(req, res);
    } else {
        // Jika pengguna tidak memiliki role 'pencari', arahkan ke halaman login
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

// Route to display all kos cards
router.get('/', berandaController.showAllKos, function(req, res){
    res.render('index', {title: 'Kosand'});
});  // Show all kos without login
// Route untuk menampilkan detail kos
router.get('/detailkospencari/:id', detailKosPencari.showDetailKosPencari, (req, res) => {
    if (req.session.user && req.session.user.role === 'pencari') {
        res.render('detailkospencari/:id', { user: req.session.user, title: 'Detail Kos - Pencari' });
    } else {
        res.redirect('/login');
    }
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

// Route for the map page
router.get('/map', mapController.showMap);

// Rute GET untuk menampilkan halaman booking
router.get('/bookingPage/:kosId', bookingController.showBookingPage);
// Rute untuk menyimpan data booking
router.post('/pemesanan', bookingController.createBooking);
// Rute POST untuk menyimpan data booking
router.post('/bookingPage', bookingController.createBooking);
// Rute untuk membatalkan pesanan
router.post('/batalkanPesanan', bookingController.cancelBooking);  // Menambahkan rute ini
// Rute untuk menampilkan daftar booking kos
router.get('/myBookings', bookingController.showMyBookings);
// Rute untuk menampilkan daftar booking kos
router.get('/daftarBookingPemilik', daftarBookingPemilikController.showDaftarBookingPemilik);

// Route untuk menandai booking sebagai complete
router.post('/completeBooking/:bookingId', daftarBookingPemilikController.completeBooking);

// Route untuk halaman rating
router.get('/ratingPage', bookingController.showRatingPage);

// Route untuk menyimpan rating
router.post('/saveRating', bookingController.saveRating);
// Route untuk logout
router.get('/logout', (req, res) => {
    // Hapus data session user
    req.session.destroy((err) => {
        let logout
        if (err) {
            return res.status(500).send("Gagal logout");
        }
        // Redirect ke halaman index setelah logout
        res.redirect('/');
    });
});


router.get('/hubungiPemilik/:kosId', hubungiPemilikController.showHubungiPemilik);


module.exports = router;
