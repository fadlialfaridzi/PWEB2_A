const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ===== KELOLA PENGGUNA =====
router.get('/pengguna', adminController.kelolaPengguna);

// ===== KELOLA KOS =====
router.get('/kos', adminController.kelolaKos);

// ===== PANTAU BOOKING =====
router.get('/booking', adminController.pantauBooking);

// ===== KELOLA REPORT =====
router.get('/report', adminController.kelolaReport);

// ===== LIHAT STATISTIK =====
router.get('/statistik', adminController.lihatStatistik);

module.exports = router;
