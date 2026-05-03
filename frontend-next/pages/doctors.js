import { useEffect, useState } from 'react';
import axios from 'axios';
import DoctorCard from '../components/DoctorCard';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function Doctors() {
  const [specialization, setSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/doctors`, { params: { specialization } });
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    await fetchDoctors();
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor Directory</p>
          <h1>Find medical experts by specialty and availability</h1>
        </div>
      </div>
      <div className="search-panel">
        <input
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          placeholder="Search by specialization"
        />
        <button onClick={handleSearch} className="button button-primary">Filter doctors</button>
      </div>
      {loading ? (
        <p>Loading doctors…</p>
      ) : (
        <div className="grid-list">
          {doctors.length ? doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />) : <p>No doctors found yet.</p>}
        </div>
      )}
    </section>
  );
}
