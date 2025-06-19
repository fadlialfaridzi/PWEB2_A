const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownercontroller');


// Daftar Bookingan Kos
router.get('/bookings', ownerController.getAllBookings);

// Detail Pemesanan
router.get('/booking/:id', ownerController.getBookingDetail);

// Konfirmasi / Tolak Pemesanan
router.post('/booking/:id/confirm', ownerController.confirmBooking);
router.post('/booking/:id/reject', ownerController.rejectBooking);

// Update Lokasi Kos
router.get('/kos/:id/edit-location', ownerController.getEditLocationPage);
router.post('/kos/:id/update-location', ownerController.updateLocation);

// Review & Balasan
router.get('/reviews', ownerController.getAllReviews);
router.post('/reviews/:id/reply', ownerController.replyReview);

module.exports = router;