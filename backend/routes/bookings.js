const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Placeholder booking data - replace with database
const bookings = [];

// Create booking
router.post('/', authenticateToken, (req, res) => {
  const { hospital_id, procedure, booking_date } = req.body;
  
  const booking = {
    id: bookings.length + 1,
    patient_id: req.user.id,
    hospital_id,
    procedure,
    booking_date,
    status: 'pending',
    created_at: new Date()
  };
  
  bookings.push(booking);
  res.status(201).json({ booking });
});

// Get user bookings
router.get('/my', authenticateToken, (req, res) => {
  const userBookings = bookings.filter(b => b.patient_id === req.user.id);
  res.json({ bookings: userBookings });
});

// Get booking by ID
router.get('/:id', authenticateToken, (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Check if user owns this booking
  if (booking.patient_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json({ booking });
});

// Update booking status (simplified - in real app, only hospital/admin can do this)
router.put('/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  const bookingIndex = bookings.findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  bookings[bookingIndex].status = status;
  res.json({ booking: bookings[bookingIndex] });
});

module.exports = router;