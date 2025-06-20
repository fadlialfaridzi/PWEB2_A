const express = require('express');
const router = express.Router();
const kosController = require('../controllers/kosController');

router.get("/rating", kosController.lihatRating);
router.post("/rating", kosController.kasihRating);
router.get("/rating-list", kosController.lihatListRating);
router.get("/booking", kosController.formBooking);
router.post("/booking", kosController.prosesBooking);
router.get("/favorit", kosController.formFavorit);
router.post("/favorit", kosController.prosesFavorit);
router.get('/pemilik/:id', kosController.lihatProfilPemilik);
router.get('/report/:id', kosController.reportKosForm);
router.post('/report', kosController.reportKosSubmit);

module.exports = router;