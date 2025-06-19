const Booking = require('../models/Booking');
const Review = require('../models/Review');


exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find({ ownerId: req.user.id });
  res.render('owner/bookings', { bookings });
};

exports.getBookingDetail = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  res.render('owner/bookingDetail', { booking });
};

exports.confirmBooking = async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: 'confirmed' });
  res.redirect('/owner/bookings');
};

exports.rejectBooking = async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  res.redirect('/owner/bookings');
};

exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find({ ownerId: req.user.id }); // sesuaikan model jika perlu
  res.render('owner/reviews', { reviews });
};

exports.replyReview = async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  await Review.findByIdAndUpdate(id, { reply: reply });
  res.redirect('/owner/reviews');
};
