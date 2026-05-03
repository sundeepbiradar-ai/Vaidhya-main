const cron = require('node-cron');
const { fetchPlacesForCity } = require('../services/googlePlaces');
const { indexHospitalRecord } = require('../services/elasticsearch');
const { query } = require('../db');

const refreshHospitalData = async () => {
  try {
    const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'];
    for (const city of cities) {
      const hospitals = await fetchPlacesForCity(city);
      for (const data of hospitals) {
        const existing = await query('SELECT id FROM hospitals WHERE unique_key = $1', [data.unique_key]);
        if (existing.rows.length) continue;
        const insert = await query(
          `INSERT INTO hospitals (name, city, state, address, phone, website_url, latitude, longitude, rating, specialties, emergency, unique_key, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING *`,
          [data.name, data.city, data.state, data.address, data.phone, data.websiteUrl, data.latitude, data.longitude, data.rating, data.specialty, data.emergency, data.unique_key]
        );
        await indexHospitalRecord(insert.rows[0]);
      }
    }
    console.log('Scheduled hospital refresh completed');
  } catch (error) {
    console.error('Hospital refresh error', error);
  }
};

const initializeJobs = () => {
  cron.schedule('0 2 * * *', refreshHospitalData, { timezone: 'UTC' });
  console.log('Background job scheduled: hospital refresh at 02:00 UTC daily');
};

module.exports = { initializeJobs, refreshHospitalData };
