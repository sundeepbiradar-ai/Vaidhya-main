const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/doctors - Get all doctors with optional filters
router.get('/', async (req, res) => {
  try {
    const { specialization, hospital_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        d.doctor_id as id,
        d.doctor_name as name,
        d.specialization,
        d.years_experience,
        d.qualification,
        d.consultation_fee,
        d.availability_hours,
        h.hospital_name,
        h.city,
        h.rating
      FROM doctors d
      LEFT JOIN hospitals h ON d.hospital_id = h.hospital_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (specialization) {
      query += ` AND d.specialization ILIKE $${paramIndex}`;
      params.push(`%${specialization}%`);
      paramIndex++;
    }

    if (hospital_id) {
      query += ` AND d.hospital_id = $${paramIndex}`;
      params.push(hospital_id);
      paramIndex++;
    }

    query += ` ORDER BY d.doctor_name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      doctors: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        d.doctor_id as id,
        d.doctor_name as name,
        d.specialization,
        d.years_experience,
        d.qualification,
        d.consultation_fee,
        d.availability_hours,
        h.hospital_id,
        h.hospital_name,
        h.city,
        h.address,
        h.contact_number as phone,
        h.rating
      FROM doctors d
      LEFT JOIN hospitals h ON d.hospital_id = h.hospital_id
      WHERE d.doctor_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ doctor: result.rows[0] });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// POST /api/doctors - Create new doctor (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      specialization,
      hospital_id,
      expertise,
      years_experience,
      qualification,
      consultation_fee,
      consultation_types,
      availability_slots
    } = req.body;

    const query = `
      INSERT INTO doctors (
        doctor_name, specialization, hospital_id, years_experience,
        qualification, consultation_fee, availability_hours
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING doctor_id
    `;

    const result = await pool.query(query, [
      name, specialization, hospital_id, years_experience || 0,
      qualification, consultation_fee, availability_slots || {}
    ]);

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// PUT /api/doctors/:id - Update doctor (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      specialization,
      hospital_id,
      expertise,
      years_experience,
      qualification,
      consultation_fee,
      consultation_types,
      availability_slots
    } = req.body;

    const query = `
      UPDATE doctors SET
        doctor_name = $1,
        specialization = $2,
        hospital_id = $3,
        years_experience = $4,
        qualification = $5,
        consultation_fee = $6,
        availability_hours = $7
      WHERE doctor_id = $8
      RETURNING doctor_id
    `;

    const result = await pool.query(query, [
      name, specialization, hospital_id, years_experience || 0,
      qualification, consultation_fee, availability_slots || {}, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// DELETE /api/doctors/:id - Delete doctor (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM doctors WHERE doctor_id = $1 RETURNING doctor_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

module.exports = router;