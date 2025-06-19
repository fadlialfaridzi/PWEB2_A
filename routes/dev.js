// routes/dev.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

router.get('/add-dummy-review', async (req, res) => {
  await Review.create({
    reviewerName: 'Mahasiswa Uda',
    content: 'Kosan bersih dan nyaman',
    rating: 5,
    ownerId: '1122' // ganti dengan ID pemilik kos
  });
  res.send('Dummy review berhasil ditambahkan');
});

module.exports = router;
