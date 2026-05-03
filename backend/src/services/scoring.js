const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
};

const buildLocationScore = ({ hospital, userLat, userLon, querySpecialization }) => {
  const distance = hospital.latitude && hospital.longitude ? haversineDistance(userLat, userLon, hospital.latitude, hospital.longitude) : 100;
  const proximityScore = Math.max(0, 100 - Math.min(distance, 100)) / 100;
  const specializationMatch = querySpecialization && hospital.specialties ? (hospital.specialties.map((s) => s.toLowerCase()).includes(querySpecialization.toLowerCase()) ? 1 : 0) : 0;
  const ratingScore = hospital.rating ? Math.min(hospital.rating / 5, 1) : 0;

  return (0.4 * proximityScore) + (0.4 * specializationMatch) + (0.2 * ratingScore);
};

module.exports = { buildLocationScore, haversineDistance };
