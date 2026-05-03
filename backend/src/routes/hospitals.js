const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { query } = require('../db');
const { fetchPlacesForCity } = require('../services/googlePlaces');
const { indexHospitalRecord, searchHospitals } = require('../services/elasticsearch');
const { buildLocationScore } = require('../services/scoring');

const router = express.Router();

router.get('/', async (req, res) => {
  const { city, lat, lon, specialization, page = 1, limit = 20 } = req.query;
  if (city || lat || lon) {
    const result = await searchHospitals({ city, lat, lon, specialization, page, limit });
    return res.json(result);
  }

  const offset = (page - 1) * limit;
  const hospitals = await query('SELECT * FROM hospitals ORDER BY rating DESC NULLS LAST LIMIT $1 OFFSET $2', [limit, offset]);
  const count = await query('SELECT COUNT(*) FROM hospitals');
  res.json({ hospitals: hospitals.rows, total: parseInt(count.rows[0].count, 10) });
});

router.get('/:id', async (req, res) => {
  const result = await query(
    `SELECT h.*, json_agg(DISTINCT jsonb_build_object('id', d.id, 'name', d.name, 'specialization', d.specialization, 'fee', d.fee)) AS doctors
     FROM hospitals h
     LEFT JOIN doctors d ON d.hospital_id = h.id
     WHERE h.id = $1
     GROUP BY h.id`,
    [req.params.id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Hospital not found' });
  }
  res.json(result.rows[0]);
});

router.post('/ingest-city', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }
  const hospitals = await fetchPlacesForCity(city);
  await Promise.all(hospitals.map((hospital) => indexHospitalRecord(hospital)));
  res.json({ message: `Ingested ${hospitals.length} hospitals for ${city}`, hospitals });
});

router.post('/', authenticateToken, authorizeRoles('hospital_admin', 'admin'), async (req, res) => {
  const { name, city, state, address, latitude, longitude, rating, specializations, insurance, emergency, websiteUrl, phone } = req.body;
  const insert = await query(
    `INSERT INTO hospitals (name, city, state, address, latitude, longitude, rating, specialties, insurance_partners, emergency, website_url, phone)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [name, city, state, address, latitude, longitude, rating, specializations, insurance, emergency, websiteUrl, phone]
  );
  await indexHospitalRecord(insert.rows[0]);
  res.status(201).json({ hospital: insert.rows[0] });
});

module.exports = router;
