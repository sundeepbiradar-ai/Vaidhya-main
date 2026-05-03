const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { query } = require('../db');
const router = express.Router();

router.put('/hospitals/:id', authenticateToken, authorizeRoles('hospital_admin', 'admin'), async (req, res) => {
  const updates = req.body;
  const keys = Object.keys(updates);
  if (!keys.length) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }
  const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
  const values = keys.map((key) => updates[key]);
  values.push(req.params.id);
  const result = await query(`UPDATE hospitals SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`, values);
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Hospital not found' });
  }
  res.json({ hospital: result.rows[0] });
});

router.put('/doctors/:id', authenticateToken, authorizeRoles('doctor', 'hospital_admin', 'admin'), async (req, res) => {
  const updates = req.body;
  const keys = Object.keys(updates);
  if (!keys.length) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }
  const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
  const values = keys.map((key) => updates[key]);
  values.push(req.params.id);
  const result = await query(`UPDATE doctors SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`, values);
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  res.json({ doctor: result.rows[0] });
});

module.exports = router;
