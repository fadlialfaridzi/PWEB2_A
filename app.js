const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// ================
// Middleware
// ================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set folder public untuk file statis (CSS, gambar, dsb)
app.use(express.static(path.join(__dirname, 'public')));

// ================
// View Engine
// ================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ================
// Routes
// ================
const ownerRouter = require('./routes/owner');
app.use('/owner', ownerRouter);

// ================
// 404 Handler
// ================
app.use((req, res, next) => {
  res.status(404).render('404', {
    message: 'Halaman tidak ditemukan',
    title: '404 - Not Found'
  });
});

// ================
// Error Handler
// ================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    message: 'Terjadi kesalahan server.',
    title: '500 - Server Error'
  });
});

// ================
// Export untuk dipakai di bin/www
// ================
module.exports = app;
