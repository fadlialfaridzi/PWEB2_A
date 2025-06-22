const db = require('../config/db');

const User = {
    // Register new user
    registerUser: (name, email, phone, password, role, callback) => {
        const query = 'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, email, phone, password, role], callback);
    },

    // Find user by email
    findUserByEmail: (email, callback) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]); // Return first result or undefined
        });
    },

    // Find user by ID
    findUserById: (userId, callback) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    // Update user profile
    updateUser: (userId, userData, callback) => {
        const query = 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?';
        const values = [userData.name, userData.email, userData.phone, userId];
        db.query(query, values, callback);
    },

    // Update password
    updatePassword: (userId, newPassword, callback) => {
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        db.query(query, [newPassword, userId], callback);
    },

    // Check if email exists (for validation)
    checkEmailExists: (email, excludeUserId = null, callback) => {
        let query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
        let params = [email];
        
        if (excludeUserId) {
            query += ' AND id != ?';
            params.push(excludeUserId);
        }
        
        db.query(query, params, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0].count > 0);
        });
    }
};

module.exports = User;



