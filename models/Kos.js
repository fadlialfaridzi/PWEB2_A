const db = require('../config/db');

const Kos = {
    // Get all kos with rating (for public view)
    getAllWithRating: (callback) => {
        const query = `
            SELECT 
                k.*,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as total_ratings
            FROM kos k
            LEFT JOIN ratings r ON k.id = r.kos_id
            WHERE k.status = 'available'
            GROUP BY k.id
            ORDER BY k.id DESC
        `;
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            
            // Process photos for each kos
            const kosWithPhotosPromises = results.map((kosItem) => {
                return new Promise((resolve, reject) => {
                    const photoQuery = 'SELECT filename FROM foto_kos WHERE kos_id = ?';
                    db.query(photoQuery, [kosItem.id], (err, photos) => {
                        if (err) {
                            reject(err);
                        } else {
                            kosItem.photos = photos.map(photo => photo.filename);
                            resolve(kosItem);
                        }
                    });
                });
            });
            
            Promise.all(kosWithPhotosPromises)
                .then(kosWithPhotos => {
                    callback(null, kosWithPhotos);
                })
                .catch(err => {
                    callback(err);
                });
        });
    },

    // Get all kos with photos for owner
    getAllWithFoto: (ownerId, callback) => {
        const query = `
            SELECT k.*
            FROM kos k
            WHERE k.user_id = ?
            ORDER BY k.id DESC
        `;
        db.query(query, [ownerId], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            // Process photos for each kos
            const kosWithPhotosPromises = results.map((kosItem) => {
                return new Promise((resolve, reject) => {
                    const photoQuery = 'SELECT filename FROM foto_kos WHERE kos_id = ?';
                    db.query(photoQuery, [kosItem.id], (err, photos) => {
                        if (err) {
                            reject(err);
                        } else {
                            kosItem.photos = photos.map(photo => photo.filename);
                            resolve(kosItem);
                        }
                    });
                });
            });
            
            Promise.all(kosWithPhotosPromises)
                .then(kosWithPhotos => {
                    callback(null, kosWithPhotos);
                })
                .catch(err => {
                    callback(err);
                });
        });
    },

    // Get kos by ID
    getKosById: (kosId, callback) => {
        const query = 'SELECT * FROM kos WHERE id = ?';
        db.query(query, [kosId], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            if (results.length === 0) {
                return callback(null, null);
            }
            
            const kosItem = results[0];
            
            // Get photos for this kos
            const photoQuery = 'SELECT filename FROM foto_kos WHERE kos_id = ?';
            db.query(photoQuery, [kosId], (err, photos) => {
                if (err) {
                    return callback(err);
                }
                
                kosItem.photos = photos.map(photo => photo.filename);
                callback(null, kosItem);
            });
        });
    },

    // Get kos by IDs (for multiple kos)
    getKosByIds: (kosIds, callback) => {
        if (!kosIds || kosIds.length === 0) {
            return callback(null, []);
        }
        const query = 'SELECT * FROM kos WHERE id IN (?)';
        db.query(query, [kosIds], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            // Process photos for each kos
            const kosWithPhotosPromises = results.map((kosItem) => {
                return new Promise((resolve, reject) => {
                    const photoQuery = 'SELECT filename FROM foto_kos WHERE kos_id = ?';
                    db.query(photoQuery, [kosItem.id], (err, photos) => {
                        if (err) {
                            reject(err);
                        } else {
                            kosItem.photos = photos.map(photo => photo.filename);
                            resolve(kosItem);
                        }
                    });
                });
            });
            
            Promise.all(kosWithPhotosPromises)
                .then(kosWithPhotos => {
                    callback(null, kosWithPhotos);
                })
                .catch(err => {
                    callback(err);
                });
        });
    },

    // Get all available kos (for map)
    getAllAvailableKos: (callback) => {
        const query = `
            SELECT 
                k.id,
                k.name,
                k.address,
                k.latitude,
                k.longitude,
                k.price,
                k.payment_type,
                k.status
            FROM kos k
            WHERE k.status = 'available'
            AND k.latitude IS NOT NULL
            AND k.longitude IS NOT NULL
        `;
        db.query(query, callback);
    },

    // Add new kos
    addKos: (kosData, callback) => {
        const query = `
            INSERT INTO kos (name, description, price, payment_type, address, latitude, longitude, tipe_kos, user_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            kosData.name,
            kosData.description,
            kosData.price,
            kosData.payment_type,
            kosData.address,
            kosData.latitude,
            kosData.longitude,
            kosData.tipe_kos,
            kosData.user_id,
            'available'
        ];
        db.query(query, values, callback);
    },

    // Update kos
    updateKos: (kosId, kosData, callback) => {
        const query = `
            UPDATE kos 
            SET name = ?, description = ?, price = ?, payment_type = ?, 
                address = ?, latitude = ?, longitude = ?, tipe_kos = ?
            WHERE id = ?
        `;
        const values = [
            kosData.name,
            kosData.description,
            kosData.price,
            kosData.payment_type,
            kosData.address,
            kosData.latitude,
            kosData.longitude,
            kosData.tipe_kos,
            kosId
        ];
        db.query(query, values, callback);
    },

    // Delete kos
    deleteKos: (kosId, callback) => {
        const query = 'DELETE FROM kos WHERE id = ?';
        db.query(query, [kosId], callback);
    },

    // Update kos status
    updateStatus: (kosId, status, callback) => {
        const query = 'UPDATE kos SET status = ? WHERE id = ?';
        db.query(query, [status, kosId], callback);
    },

    // Update kos status (alias for updateStatus)
    updateKosStatus: (kosId, status, callback) => {
        const query = 'UPDATE kos SET status = ? WHERE id = ?';
        db.query(query, [status, kosId], callback);
    },

    // Get facilities for a kos
    getFasilitasKos: (kosId, callback) => {
        const query = 'SELECT * FROM fasilitas_kos WHERE kos_id = ?';
        db.query(query, [kosId], callback);
    },

    // Delete facilities for a kos
    deleteFasilitasKos: (kosId, callback) => {
        const query = 'DELETE FROM fasilitas_kos WHERE kos_id = ?';
        db.query(query, [kosId], callback);
    },

    // Add facilities for a kos
    addFasilitasKos: (kosId, fasilitas, callback) => {
        // If fasilitas is a string (single facility), convert to array
        const facilitiesArray = Array.isArray(fasilitas) ? fasilitas : [fasilitas];
        
        if (facilitiesArray.length === 0) {
            return callback(null);
        }
        
        const insertQuery = 'INSERT INTO fasilitas_kos (kos_id, fasilitas) VALUES ?';
        const values = facilitiesArray.map(facility => [kosId, facility]);
        db.query(insertQuery, [values], callback);
    },

    // Get owner info
    getOwnerInfo: (userId, callback) => {
        const query = 'SELECT id, name, email, phone FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    },

    // Get kos by owner
    getKosByOwner: (userId, callback) => {
        const query = 'SELECT * FROM kos WHERE user_id = ? ORDER BY id DESC';
        db.query(query, [userId], (err, results) => {
            if (err) {
                return callback(err);
            }
            
            // Process photos for each kos
            const kosWithPhotosPromises = results.map((kosItem) => {
                return new Promise((resolve, reject) => {
                    const photoQuery = 'SELECT filename FROM foto_kos WHERE kos_id = ?';
                    db.query(photoQuery, [kosItem.id], (err, photos) => {
                        if (err) {
                            reject(err);
                        } else {
                            kosItem.photos = photos.map(photo => photo.filename);
                            resolve(kosItem);
                        }
                    });
                });
            });
            
            Promise.all(kosWithPhotosPromises)
                .then(kosWithPhotos => {
                    callback(null, kosWithPhotos);
                })
                .catch(err => {
                    callback(err);
                });
        });
    }
};

module.exports = Kos; 