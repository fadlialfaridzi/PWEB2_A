const db = require('../config/db');

const Favorit = {
    // Menambahkan kos ke favorit
    addToFavorites: (userId, kosId, callback) => {
        const query = 'INSERT INTO favorites (user_id, kos_id) VALUES (?, ?)';
        db.query(query, [userId, kosId], callback);
    },

    // Menghapus kos dari favorit
    removeFromFavorites: (userId, kosId, callback) => {
        const query = 'DELETE FROM favorites WHERE user_id = ? AND kos_id = ?';
        db.query(query, [userId, kosId], callback);
    },

    // Mengecek apakah kos sudah difavoritkan
    isFavorited: (userId, kosId, callback) => {
        const query = 'SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND kos_id = ?';
        db.query(query, [userId, kosId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0].count > 0);
        });
    },

    // Mengambil semua kos favorit user
    getUserFavorites: (userId, callback) => {
        const query = `
            SELECT 
                k.*,
                f.created_at as favorited_at,
                u.name as owner_name,
                u.phone as owner_phone,
                GROUP_CONCAT(DISTINCT fk.fasilitas) as facilities
            FROM favorites f
            JOIN kos k ON f.kos_id = k.id
            JOIN users u ON k.user_id = u.id
            LEFT JOIN fasilitas_kos fk ON k.id = fk.kos_id
            WHERE f.user_id = ?
            GROUP BY k.id
            ORDER BY f.created_at DESC
        `;
        db.query(query, [userId], callback);
    },

    // Mengambil jumlah favorit untuk suatu kos
    getFavoriteCount: (kosId, callback) => {
        const query = 'SELECT COUNT(*) as count FROM favorites WHERE kos_id = ?';
        db.query(query, [kosId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0].count);
        });
    },

    // Mengambil semua favorit dengan detail lengkap untuk halaman favorit
    getFavoritesWithDetails: (userId, callback) => {
        const query = `
            SELECT 
                k.*,
                f.created_at as favorited_at,
                u.name as owner_name,
                u.phone as owner_phone,
                GROUP_CONCAT(DISTINCT fk.fasilitas) as facilities
            FROM favorites f
            JOIN kos k ON f.kos_id = k.id
            JOIN users u ON k.user_id = u.id
            LEFT JOIN fasilitas_kos fk ON k.id = fk.kos_id
            WHERE f.user_id = ?
            GROUP BY k.id
            ORDER BY f.created_at DESC
        `;
        db.query(query, [userId], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            // Process results to format facilities and photos
            const processedResults = results.map(kos => {
                // Format facilities
                if (kos.facilities) {
                    kos.facilities = kos.facilities.split(',').map(f => f.trim());
                } else {
                    kos.facilities = [];
                }

                // Set default values for rating
                kos.average_rating = 0;
                kos.rating_count = 0;

                // Get photos for this kos
                return new Promise((resolve, reject) => {
                    const photoQuery = 'SELECT filename FROM foto_kos WHERE kos_id = ?';
                    db.query(photoQuery, [kos.id], (photoErr, photoResults) => {
                        if (photoErr) {
                            reject(photoErr);
                        } else {
                            kos.photos = photoResults.map(p => p.filename);
                            resolve(kos);
                        }
                    });
                });
            });

            Promise.all(processedResults)
                .then(processedKos => callback(null, processedKos))
                .catch(err => callback(err));
        });
    }
};

module.exports = Favorit; 