var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const authRoutes = require('./routes/authRoutes');
var indexRouter = require('./routes/index');

var app = express();

// Middleware for session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
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

// Routes for role-based page rendering
app.get('/indexpencarikos', (req, res) => {
    if (req.session.user && req.session.user.role === 'pencari') {
        res.render('indexpencarikos', { user: req.session.user }); // Pass user to EJS template
    } else {
        res.redirect('/login');  // Redirect to login if no session or role mismatch
    }
});

app.get('/indexpemilikkos', (req, res) => {
    if (req.session.user && req.session.user.role === 'pemilik') {
        res.render('indexpemilikkos');
    } else {
        res.redirect('/login');
    }
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
