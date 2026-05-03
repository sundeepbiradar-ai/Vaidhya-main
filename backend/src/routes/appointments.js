const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { doctor_id, hospital_id, appointment_date, slot, consultation_type } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const conflict = await client.query(
      `SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND slot = $3 AND status IN ('confirmed','pending') FOR UPDATE`,
      [doctor_id, appointment_date, slot]
    );
    if (conflict.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Slot already booked, choose another time' });
    }
    const result = await client.query(
      `INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, slot, consultation_type, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',NOW()) RETURNING *`,
      [req.user.id, doctor_id, hospital_id, appointment_date, slot, consultation_type]
    );
    await client.query('COMMIT');
    res.status(201).json({ appointment: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Booking failed' });
  } finally {
    client.release();
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM appointments WHERE patient_id = $1 ORDER BY appointment_date DESC LIMIT 50', [req.user.id]);
  res.json({ appointments: result.rows });
});

router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const result = await pool.query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Appointment not found' });
  res.json({ appointment: result.rows[0] });
});

module.exports = router;
