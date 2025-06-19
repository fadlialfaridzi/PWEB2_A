const mongoose = require('mongoose');

const kosSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  alamat: { type: String, required: true },
  pemilikId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tersedia: { type: Boolean, default: true } // ✅ ini field yang kita maksud
});

module.exports = mongoose.model('Kos', kosSchema);
