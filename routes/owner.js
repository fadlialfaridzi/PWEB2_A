const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

// Route untuk menampilkan halaman booking dari database
router.get('/booking-page', ownerController.getAllBookings);
router.get('/list-kos', ownerController.getKosList);
router.post('/kos/:id/toggle', ownerController.toggleKosAvailability); // opsional

module.exports = router;
