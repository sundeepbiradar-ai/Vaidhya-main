const express = require('express');
const authRoutes = require('./auth');
const hospitalRoutes = require('./hospitals');
const doctorRoutes = require('./doctors');
const appointmentRoutes = require('./appointments');
const adminRoutes = require('./admin');
const searchRoutes = require('./search');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/search', searchRoutes);

module.exports = router;
