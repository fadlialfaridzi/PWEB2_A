const db = require('../config/db');

const FotoKos = {
    addFoto: (kosId, filename, callback) => {
        const query = `INSERT INTO foto_kos (kos_id, filename) VALUES (?, ?)`;
        db.query(query, [kosId, filename], callback);
    },

    // Fungsi untuk menghapus foto berdasarkan kos_id
    deleteFotoByKosId: (kosId, callback) => {
        const query = `DELETE FROM foto_kos WHERE kos_id = ?`;
        db.query(query, [kosId], callback);
    },
};

module.exports = FotoKos;
