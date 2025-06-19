// routes/dev.js (buat file baru)
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

router.get('/add-dummy-review', async (req, res) => {
  await Review.create({
    reviewerName: 'Mahasiswa Uda',
    content: 'Kosan bersih dan nyaman',
    rating: 5,
    ownerId: '666666666666666666666666' // ganti dengan ID pemilik kos kamu
  });
  res.send('Dummy review berhasil ditambahkan');
});

module.exports = router;
