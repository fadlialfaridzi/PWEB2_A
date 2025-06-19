var express = require('express');
var router = express.Router();

/* GET beranda / index page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login - Kosand' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register - Kosand' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Register - Kosand' });
});

/* GET role page. */
router.get('/role', function(req, res, next) {
  res.render('role', { title: 'Register - Kosand' });
});

/* GET role page. */
router.get('/editlocation', function(req, res, next) {
  res.render('editlocation', { title: 'Register - Kosand' });
});


module.exports = router;
