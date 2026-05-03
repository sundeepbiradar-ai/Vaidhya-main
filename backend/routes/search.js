const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/search/hospitals - Search hospitals with filters
router.get('/hospitals', async (req, res) => {
  try {
    const { q, city, specialization, emergency, limit = 18, offset = 0 } = req.query;

    let query = `
      SELECT
        hospital_id as id,
        hospital_name as name,
        city,
        state,
        address,
        contact_number as phone,
        email,
        website_url as website,
        map_latitude as latitude,
        map_longitude as longitude,
        established_year,
        ownership_type,
        accreditation,
        rating
      FROM hospitals
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Text search across hospital name and city
    if (q) {
      query += ` AND (hospital_name ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    // City filter
    if (city) {
      query += ` AND city ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    // Emergency services filter - commented out since column doesn't exist
    // if (emergency === 'true') {
    //   query += ` AND emergency = true`;
    // }

    // Add ordering and pagination
    query += ` ORDER BY rating DESC NULLS LAST, hospital_name ASC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      hospitals: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error searching hospitals:', error);
    res.status(500).json({ error: 'Failed to search hospitals' });
  }
});

module.exports = router;