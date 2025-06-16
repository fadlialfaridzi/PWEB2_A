const db = require('../config/db');

const FotoKos = {
    addFoto: (kosId, filename, callback) => {
        const query = `INSERT INTO foto_kos (kos_id, filename) VALUES (?, ?)`;
        db.query(query, [kosId, filename], callback);
    }
};

module.exports = FotoKos;
