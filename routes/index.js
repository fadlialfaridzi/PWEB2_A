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

/* GET role page. */
router.get('/role', function(req, res, next) {
  res.render('role', { title: 'Register - Kosand' });
});

/* GET role page. */
router.get('/owner', function(req, res, next) {
  res.render('owner', { title: 'Owner Username - Kosand' });
});

module.exports = router;
