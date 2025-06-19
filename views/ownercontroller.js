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
