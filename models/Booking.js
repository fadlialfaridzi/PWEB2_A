const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  kosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kos',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tanggalBooking: {
    type: Date,
    default: Date.now,
  },
  durasi: {
    type: Number, // misalnya: 6 bulan, 12 bulan
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending',
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
