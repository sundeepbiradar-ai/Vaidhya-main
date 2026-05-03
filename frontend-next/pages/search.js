import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import HospitalCard from '../components/HospitalCard';
import { API_BASE } from '../utils/api';

export default function Search() {
  const [form, setForm] = useState({ q: '', city: '', specialization: '', emergency: false });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE}/api/search/hospitals`, {
        params: {
          q: form.q,
          city: form.city,
          specialization: form.specialization,
          emergency: form.emergency,
          limit: 18
        }
      });
      setResults(response.data.hospitals || []);
    } catch (fetchError) {
      console.error('Error fetching hospitals:', fetchError);
      setError('Unable to load hospitals. Please ensure the backend is running and try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Intelligent Hospital Search</p>
          <h1>Search hospitals, clinics, and medical centers with geo-aware relevance.</h1>
        </div>
      </div>
      <div className="search-panel">
        <input
          value={form.q}
          onChange={(e) => setForm({ ...form, q: e.target.value })}
          placeholder="Search by hospital, clinic or specialty"
        />
        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="City or location"
        />
        <input
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          placeholder="Specialization"
        />
        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={form.emergency}
            onChange={(e) => setForm({ ...form, emergency: e.target.checked })}
          />
          24x7 emergency
        </label>
        <button className="button button-primary" onClick={fetchHospitals}>Search</button>
      </div>
      {loading ? (
        <p>Loading search results…</p>
      ) : (
        <>
          {error && <p className="error-message">{error}</p>}
          <div className="grid-list">
            {results.length ? results.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} />) : <p>No hospitals found. Try broadening your search.</p>}
          </div>
        </>
      )}
      <div className="secondary-panel">
        <h2>Dynamic search experience</h2>
        <p>Our search uses fuzzy matching and geo-awareness so you can find nearby hospitals even with typos or alternate healthcare keywords.</p>
      </div>
    </section>
  );
}
