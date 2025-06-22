const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('index', { title: 'Login - Kosand' }));
router.get('/register', (req, res) => res.render('register', { title: 'Register - Kosand' }));
router.get('/login', (req, res) => res.render('login', { title: 'Login - Kosand' }));
router.get('/role', (req, res) => res.render('role', { title: 'Pilih Role - Kosand' }));
router.get('/editlocation', (req, res) => res.render('editlocation', { title: 'Edit Lokasi - Kosand' }));

module.exports = router;
