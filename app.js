var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const ownerController = require('./controllers/ownerController');  // Import ownerController
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Middleware static files
app.use(express.static('public'));

// Middleware session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set secure: true jika menggunakan HTTPS
}));

// Middleware for POST data
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Use middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use auth routes for login, registration, and role selection
app.use('/', authRoutes);
app.use('/', indexRouter);

// Route untuk logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Gagal logout");
        }
        // Redirect ke halaman index setelah logout
        res.redirect('/');
    });
});

// Handle 404 errors
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
