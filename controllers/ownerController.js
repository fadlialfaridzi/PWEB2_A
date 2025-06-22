const pool = require('../db'); // koneksi ke database dari db.js

// ========================
// Booking Kos (dengan fitur pencarian)
// ========================
exports.getAllBookings = async (req, res) => {
  const search = req.query.search || '';

  try {
    const [rows] = await pool.query(`
      SELECT
        b.nama_penyewa,
        b.tanggal_booking,
        b.status,
        k.nama AS nama_kos,
        k.harga,
        k.info,
        k.gambar
      FROM bookings b
      JOIN kos k ON b.kos_id = k.id
      WHERE b.status = 'confirmed'
        AND (b.nama_penyewa LIKE ? OR k.nama LIKE ?)
    `, [`%${search}%`, `%${search}%`]);

    res.render('owner/booking', {
      bookings: rows,
      search
    });
  } catch (err) {
    console.error('[ERROR] Gagal mengambil data booking:', err);
    res.status(500).send('Terjadi kesalahan saat mengambil data booking.');
  }
};

// ========================
// Menampilkan Daftar Kos (dengan Search + Filter Status)
// ========================
exports.getKosList = async (req, res) => {
  const search = req.query.search || '';
  const status = req.query.status || '';

  let query = `
    SELECT id, nama, harga, info, gambar, status, favorite
    FROM kos
    WHERE nama LIKE ?
  `;
  const params = [`%${search}%`];

  if (status === 'tersedia' || status === 'full') {
    query += ' AND status = ?';
    params.push(status);
  }

  try {
    const [rows] = await pool.query(query, params);
    res.render('owner/kosList', {
      daftarKos: rows,
      search,
      status
    });
  } catch (err) {
    console.error('[ERROR] Gagal mengambil data kos:', err);
    res.status(500).send('Terjadi kesalahan saat mengambil data kos.');
  }
};

// ========================
// Toggle Status Kos (tersedia <=> full)
// ========================
exports.toggleKosAvailability = async (req, res) => {
  const kosId = req.params.id;

  try {
    const [rows] = await pool.query(`SELECT status FROM kos WHERE id = ?`, [kosId]);
    if (rows.length === 0) {
      return res.status(404).send('Kos tidak ditemukan.');
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 'tersedia' ? 'full' : 'tersedia';

    await pool.query(`UPDATE kos SET status = ? WHERE id = ?`, [newStatus, kosId]);

    res.redirect('/owner/list-kos');
  } catch (err) {
    console.error('[ERROR] Gagal mengubah status kos:', err);
    res.status(500).send('Terjadi kesalahan saat memperbarui status kos.');
  }
};

// ========================
// Toggle Favorite Kos
// ========================
exports.toggleFavoriteKos = async (req, res) => {
  const kosId = req.params.id;

  try {
    const [rows] = await pool.query(`SELECT favorite FROM kos WHERE id = ?`, [kosId]);
    if (rows.length === 0) {
      return res.status(404).send('Kos tidak ditemukan.');
    }

    const currentFavorite = rows[0].favorite;
    const newFavorite = currentFavorite === 1 ? 0 : 1;

    await pool.query(`UPDATE kos SET favorite = ? WHERE id = ?`, [newFavorite, kosId]);

    res.redirect('/owner/list-kos');
  } catch (err) {
    console.error('[ERROR] Gagal mengubah favorite kos:', err);
    res.status(500).send('Terjadi kesalahan saat mengubah status favorit.');
  }
};

// ========================
// Daftar Kos Favorit
// ========================
exports.getFavKos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nama, harga, gambar
      FROM kos
      WHERE favorite = 1
    `);

    res.render('owner/favkost', {
      favoritKos: rows
    });
  } catch (err) {
    console.error('[ERROR] Gagal mengambil kos favorit:', err);
    res.status(500).send('Terjadi kesalahan saat mengambil data favorit.');
  }
};
