// Middleware untuk memastikan user sudah login
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Middleware untuk memastikan user memiliki role tertentu
function requireRole(role) {
    return function(req, res, next) {
        if (req.session.user && req.session.user.role === role) {
            next();
        } else {
            res.redirect('/login');
        }
    };
}

module.exports = {
    requireAuth,
    requireRole
}; 