const db = require('../config/db');

const Kos = {
    // Menambahkan kos ke database
    addKos: (kosData, callback) => {
        const query = `
            INSERT INTO kos (user_id, name, price, address, latitude, longitude, description, payment_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            kosData.user_id,
            kosData.name,
            kosData.price,
            kosData.address,
            kosData.latitude,
            kosData.longitude,
            kosData.description,
            kosData.payment_type
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
            SELECT k.id, k.name, k.price, k.address, k.latitude, k.longitude, f.filename, k.payment_type
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
                        photos: [],
                        payment_type: row.payment_type
                    };
                }
                if (row.filename) {
                    grouped[row.id].photos.push(row.filename);
                }
            });

            callback(null, Object.values(grouped));
        });
    },

    // Fungsi untuk memperbarui data kos
    updateKos: (kosId, kosData, callback) => {
        const query = `
            UPDATE kos 
            SET name = ?, price = ?, payment_type = ?, address = ?, latitude = ?, longitude = ?, description = ?
            WHERE id = ?
        `;
        const params = [
            kosData.name,
            kosData.price,
            kosData.payment_type,
            kosData.address,
            kosData.latitude,
            kosData.longitude,
            kosData.description,
            kosId
        ];

        db.query(query, params, callback);
    },

    // Mendapatkan detail kos berdasarkan ID
    getKosById: (kosId, callback) => {
        const query = `
            SELECT k.id, k.name, k.price, k.address, k.latitude, k.longitude, k.description, k.payment_type, f.filename
            FROM kos k
            LEFT JOIN foto_kos f ON f.kos_id = k.id
            WHERE k.id = ?
        `;
        db.query(query, [kosId], (err, result) => {
            if (err) return callback(err, null);
            const kosItem = result[0];
            // Menyusun array foto
            const photos = result.map(row => row.filename).filter(filename => filename);
            callback(null, { ...result[0], photos });  // Ambil hasil pertama karena ID unik
        });
    },

    // Mendapatkan fasilitas kos berdasarkan ID kos
    getFasilitasKos: (kosId, callback) => {
        const query = `SELECT fasilitas FROM fasilitas_kos WHERE kos_id = ?`;
        db.query(query, [kosId], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },
    // Fungsi untuk menghapus kos dari database
    deleteKos: (kosId, callback) => {
        const query = `DELETE FROM kos WHERE id = ?`;
        db.query(query, [kosId], callback);
    },

    // Menghapus fasilitas kos berdasarkan kos_id
    deleteFasilitasKos: (kosId, callback) => {
        const query = `DELETE FROM fasilitas_kos WHERE kos_id = ?`;
        db.query(query, [kosId], callback);
    }
};



module.exports = Kos;
