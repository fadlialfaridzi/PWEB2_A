const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

// ===============================
// Booking Kos
// ===============================

// Menampilkan halaman daftar booking kos yang sudah dikonfirmasi, dengan fitur pencarian
router.get('/booking-page', ownerController.getAllBookings);

// ===============================
// Daftar Kos & Filter
// ===============================

// Menampilkan daftar semua kos, dengan filter status dan pencarian
router.get('/list-kos', ownerController.getKosList);

// Toggle status kos antara "tersedia" ↔ "full"
router.post('/kos/:id/toggle', ownerController.toggleKosAvailability);

// ===============================
// Kos Favorit
// ===============================

// Menampilkan daftar kos yang difavoritkan (favorite = 1)
router.get('/fav-kos', ownerController.getFavKos);

// Toggle status favorit untuk kos (favorite = 1 atau 0)
router.post('/kos/:id/favorite', ownerController.toggleFavoriteKos);


module.exports = router;
