const db = require('../config/db');

const Kos = {
    addKos: (kosData) => {
        const query = 'INSERT INTO kos (user_id, name, price, facilities) VALUES (?, ?, ?, ?)';
        return db.query(query, [kosData.user_id, kosData.name, kosData.price, kosData.facilities]);
    },

    getKosByUserId: (userId) => {
        const query = 'SELECT * FROM kos WHERE user_id = ?';
        return db.query(query, [userId]);
    }
};

module.exports = Kos;
