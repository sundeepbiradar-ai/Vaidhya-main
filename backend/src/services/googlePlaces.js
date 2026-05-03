const axios = require('axios');
const { google } = require('../config');

const normalizeHospital = (place) => ({
  name: place.name,
  city: place.vicinity?.split(',').slice(-2, -1)[0]?.trim() || place.address_components?.find((a) => a.types.includes('locality'))?.long_name || '',
  state: place.address_components?.find((a) => a.types.includes('administrative_area_level_1'))?.long_name || '',
  address: place.vicinity || place.formatted_address || '',
  phone: place.formatted_phone_number || null,
  websiteUrl: place.website || null,
  latitude: place.geometry?.location?.lat,
  longitude: place.geometry?.location?.lng,
  rating: place.rating || 0,
  specialty: place.types || [],
  emergency: place.types?.includes('hospital') || false,
  unique_key: `${place.name}-${place.geometry?.location?.lat}-${place.geometry?.location?.lng}`
});

const fetchPlacesForCity = async (city) => {
  if (!google.placesKey) {
    throw new Error('Google Places API key not configured');
  }

  const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const params = {
    query: `${city} hospitals medical centers clinics`,
    key: google.placesKey,
    type: 'hospital',
    pagetoken: undefined
  };

  let results = [];
  let pageToken = null;

  do {
    if (pageToken) {
      params.pagetoken = pageToken;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    const response = await axios.get(url, { params });
    const payload = response.data;
    results = results.concat(payload.results.map(normalizeHospital));
    pageToken = payload.next_page_token;
  } while (pageToken && results.length < 50);

  return results;
};

module.exports = { fetchPlacesForCity };
