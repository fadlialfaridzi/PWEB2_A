const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reply: {
    type: String,
    default: ''
  },
  kosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kos'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
