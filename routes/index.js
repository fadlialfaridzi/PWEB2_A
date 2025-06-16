var express = require('express');
var router = express.Router();
const upload = require('../config/upload');
const ownerController = require('../controllers/ownerController'); // Pastikan path ke controller benar

/* GET beranda / index page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login - Kosand' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register - Kosand' });
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
