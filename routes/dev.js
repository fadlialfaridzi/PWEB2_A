const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

router.get('/add-dummy-review', (req, res) => {
  Review.addDummyReview((err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Gagal menambahkan dummy review');
    }
    res.send('✅ Dummy review berhasil ditambahkan');
  });
});

module.exports = router;
