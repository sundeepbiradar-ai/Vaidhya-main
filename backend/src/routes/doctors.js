const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { query } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const { specialization, expertise, page = 1, limit = 25 } = req.query;
  let filters = [];
  const params = [];

  if (specialization) {
    params.push(specialization);
    filters.push(`specialization ILIKE $${params.length}`);
  }
  if (expertise) {
    params.push(`%${expertise}%`);
    filters.push(`expertise ILIKE $${params.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  const sql = `SELECT * FROM doctors ${whereClause} ORDER BY years_experience DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  res.json({ doctors: result.rows, page: Number(page), limit: Number(limit) });
});

router.post('/', authenticateToken, authorizeRoles('doctor', 'hospital_admin', 'admin'), async (req, res) => {
  const { hospital_id, name, specialization, expertise, years_experience, fee, consultation_types, profile_image_url } = req.body;
  const result = await query(
    `INSERT INTO doctors (hospital_id, name, specialization, expertise, years_experience, fee, consultation_types, profile_image_url, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *`,
    [hospital_id, name, specialization, expertise, years_experience, fee, consultation_types, profile_image_url]
  );
  res.status(201).json({ doctor: result.rows[0] });
});

router.get('/:id', async (req, res) => {
  const result = await query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Doctor not found' });
  res.json({ doctor: result.rows[0] });
});

router.put('/:id/availability', authenticateToken, authorizeRoles('doctor', 'hospital_admin', 'admin'), async (req, res) => {
  const { slots } = req.body;
  await query('UPDATE doctors SET availability_slots = $1 WHERE id = $2', [slots, req.params.id]);
  res.json({ message: 'Availability updated' });
});

module.exports = router;
