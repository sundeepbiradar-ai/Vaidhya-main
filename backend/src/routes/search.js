const express = require('express');
const { searchHospitals, getAutoSuggestions, suggestByCity } = require('../services/elasticsearch');
const { redisClient } = require('../db');

const router = express.Router();

router.get('/hospitals', async (req, res) => {
  const {
    q,
    city,
    lat,
    lon,
    specialization,
    emergency,
    insurance,
    page = 1,
    limit = 20
  } = req.query;

  const cacheKey = `search:${q || ''}:${city || ''}:${lat || ''}:${lon || ''}:${specialization || ''}:${emergency || ''}:${insurance || ''}:${page}:${limit}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const result = await searchHospitals({
    query: q,
    city,
    lat,
    lon,
    specialization,
    emergency: emergency === 'true',
    insurance,
    page,
    limit
  });
  await redisClient.setex(cacheKey, 120, JSON.stringify(result));
  res.json(result);
});

router.get('/suggest', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query is required' });
  }
  const suggestions = await getAutoSuggestions(q);
  res.json({ suggestions });
});

router.get('/city/:cityName', async (req, res) => {
  const { cityName } = req.params;
  const suggestions = await suggestByCity(cityName);
  res.json({ city: cityName, suggestions });
});

module.exports = router;
