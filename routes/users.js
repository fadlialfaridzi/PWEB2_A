const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/favorites', userController.getFavoriteKos);

module.exports = router;
