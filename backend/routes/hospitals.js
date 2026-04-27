const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Placeholder hospital data - replace with database
const hospitals = [
  {
    id: 1,
    name: 'City General Hospital',
    address: '123 Main St, Mumbai',
    city: 'Mumbai',
    contact_number: '+91-9876543210',
    email: 'info@citygeneral.com',
    departments: ['Cardiology', 'Neurology', 'Orthopedics'],
    bed_availability: { total: 200, available: 45 },
    rating: 4.2
  },
  {
    id: 2,
    name: 'Metro Medical Center',
    address: '456 Health Ave, Delhi',
    city: 'Delhi',
    contact_number: '+91-9876543211',
    email: 'info@metromedical.com',
    departments: ['Cardiology', 'Oncology', 'Pediatrics'],
    bed_availability: { total: 150, available: 30 },
    rating: 4.5
  }
];

// Get all hospitals
router.get('/', (req, res) => {
  const { city, limit = 10 } = req.query;
  let filteredHospitals = hospitals;
  
  if (city) {
    filteredHospitals = hospitals.filter(h => 
      h.city.toLowerCase().includes(city.toLowerCase())
    );
  }
  
  res.json({
    hospitals: filteredHospitals.slice(0, limit),
    total: filteredHospitals.length
  });
});

// Search hospitals
router.get('/search', (req, res) => {
  const { q, city } = req.query;
  let results = hospitals;
  
  if (q) {
    results = results.filter(h => 
      h.name.toLowerCase().includes(q.toLowerCase()) ||
      h.city.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  if (city) {
    results = results.filter(h => h.city.toLowerCase() === city.toLowerCase());
  }
  
  res.json({ results, count: results.length });
});

// Get hospital by ID
router.get('/:id', (req, res) => {
  const hospital = hospitals.find(h => h.id === parseInt(req.params.id));
  if (!hospital) {
    return res.status(404).json({ error: 'Hospital not found' });
  }
  res.json({ hospital });
});

// Compare hospitals
router.post('/compare', (req, res) => {
  const { hospitalIds } = req.body;
  const comparison = hospitals.filter(h => hospitalIds.includes(h.id));
  res.json({ comparison });
});

module.exports = router;