const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
const ownerRouter = require('./routes/owner');
app.use('/owner', ownerRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).send('Halaman tidak ditemukan');
});

// Jalankan server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
