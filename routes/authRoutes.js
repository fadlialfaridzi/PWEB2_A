const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for registration form (role selection)
router.get('/role', (req, res) => {
  res.render('role'); // Display the role selection page
});

// Route to handle registration based on role
router.get('/register/pemilik', (req, res) => {
  res.render('register', { role: 'pemilik' });
});

router.get('/register/pencari', (req, res) => {
  res.render('register', { role: 'pencari' });
});

// Route for login form
router.get('/login', (req, res) => {
  res.render('login');
});

// POST route for registration
router.post('/register', authController.register);
// POST route for login
router.post('/login', authController.login);

module.exports = router;
