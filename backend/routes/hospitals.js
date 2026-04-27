const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const { city, limit = 10 } = req.query;
    let query = 'SELECT * FROM Hospitals';
    let params = [];
    let conditions = [];

    if (city) {
      conditions.push('city ILIKE $' + (params.length + 1));
      params.push(`%${city}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await db.query(query, params);
    res.json({
      hospitals: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Search hospitals
router.get('/search', async (req, res) => {
  try {
    const { q, city } = req.query;
    let query = 'SELECT * FROM Hospitals';
    let params = [];
    let conditions = [];

    if (q) {
      conditions.push('(hospital_name ILIKE $' + (params.length + 1) + ' OR city ILIKE $' + (params.length + 2) + ')');
      params.push(`%${q}%`, `%${q}%`);
    }

    if (city) {
      conditions.push('city ILIKE $' + (params.length + 1));
      params.push(`%${city}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await db.query(query, params);
    res.json({ results: result.rows, count: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get hospital by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Hospitals WHERE hospital_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json({ hospital: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Compare hospitals
router.post('/compare', async (req, res) => {
  try {
    const { hospitalIds } = req.body;
    if (!hospitalIds || !Array.isArray(hospitalIds)) {
      return res.status(400).json({ error: 'hospitalIds array required' });
    }

    const placeholders = hospitalIds.map((_, i) => `$${i + 1}`).join(',');
    const hospitalsResult = await db.query(`SELECT * FROM Hospitals WHERE hospital_id IN (${placeholders})`, hospitalIds);

    // For each hospital, get additional data
    const comparison = await Promise.all(hospitalsResult.rows.map(async (hospital) => {
      const [facilities, beds, doctors] = await Promise.all([
        db.query('SELECT * FROM Facilities WHERE hospital_id = $1', [hospital.hospital_id]),
        db.query('SELECT * FROM Beds WHERE hospital_id = $1', [hospital.hospital_id]),
        db.query('SELECT * FROM Doctors WHERE hospital_id = $1', [hospital.hospital_id])
      ]);

      return {
        ...hospital,
        facilities: facilities.rows,
        beds: beds.rows,
        doctors: doctors.rows
      };
    }));

    res.json({ comparison });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;