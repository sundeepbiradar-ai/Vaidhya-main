const express = require('express');
const router = express.Router();

// Import the bookings router to reuse functionality
const bookingsRouter = require('./bookings');

// Use the bookings routes under /appointments
router.use('/', bookingsRouter);

module.exports = router;