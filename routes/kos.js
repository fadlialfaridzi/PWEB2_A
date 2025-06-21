const express = require('express');
const router = express.Router();
const kosController = require('../controllers/kosController');

// ===== RATING =====
router.get("/rating", kosController.lihatRating);
router.post("/rating", kosController.kasihRating);
router.get("/rating-list", kosController.lihatListRating);

// ===== BOOKING =====
router.get('/booking', kosController.formBooking);
router.post('/booking', kosController.prosesBooking);

// ===== FAVORIT =====
router.get("/favorit", kosController.formFavorit);
router.post("/favorit", kosController.prosesFavorit);

// ===== DASHBOARD PEMILIK =====
router.get('/pemilik/dashboard', kosController.dashboardPemilik);

// ===== TAMBAH KOS =====
router.get('/pemilik/tambah-kos', kosController.formTambahKos);
router.post('/pemilik/tambah-kos', kosController.prosesTambahKos);

// ===== PROFIL PEMILIK =====
router.get('/pemilik/:id', kosController.lihatProfilPemilik);

// ===== REPORT KOS =====
router.get('/report/:id', kosController.reportKosForm);
router.post('/report', kosController.reportKosSubmit);

// ===== RATING POPUP (TEST) =====
router.get("/rating-popup", (req, res) => {
  res.render("kos/ratingPopup", { title: "Kasih Rating" });
});

// ===== FASILITAS =====
router.get('/fasilitas', kosController.tampilFasilitas);

module.exports = router;
