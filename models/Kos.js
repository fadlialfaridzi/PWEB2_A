const db = require('../config/db');

const Kos = {
    // Menambahkan kos ke database
    addKos: (kosData, callback) => {
        const query = `
            INSERT INTO kos (user_id, name, price, address, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            kosData.user_id,
            kosData.name,
            kosData.price,
            kosData.address,
            kosData.latitude,
            kosData.longitude
        ];

        db.query(query, params, (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    // Menambahkan fasilitas kos ke tabel fasilitas_kos
    addFasilitasKos: (kosId, fasilitas, callback) => {
    const query = `INSERT INTO fasilitas_kos (kos_id, fasilitas) VALUES (?, ?)`;
    db.query(query, [kosId, fasilitas], callback);
    },

    // Update status kos
    updateKosStatus: (kosId, status, callback) => {
        const query = `UPDATE kos SET status = ? WHERE id = ?`;
        db.query(query, [status, kosId], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    // Mendapatkan semua kos dan foto berdasarkan user_id
    getAllWithFoto: (userId, callback) => {
        const query = `
            SELECT k.id, k.name, k.price, k.address, k.latitude, k.longitude, f.filename
            FROM kos k
            LEFT JOIN foto_kos f ON f.kos_id = k.id
            WHERE k.user_id = ?
        `;

        db.query(query, [userId], (err, results) => {
            if (err) return callback(err);

            const grouped = {};
            results.forEach(row => {
                if (!grouped[row.id]) {
                    grouped[row.id] = {
                        id: row.id,
                        name: row.name,
                        price: row.price,
                        address: row.address,
                        latitude: row.latitude,
                        longitude: row.longitude,
                        photos: []
                    };
                }
                if (row.filename) {
                    grouped[row.id].photos.push(row.filename);
                }
            });

            callback(null, Object.values(grouped));
        });
    }
};

module.exports = Kos;
