import { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function Admin() {
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [hospitalForm, setHospitalForm] = useState({ id: '', name: '', address: '', phone: '' });
  const [doctorForm, setDoctorForm] = useState({ id: '', name: '', specialization: '', fee: '' });

  const handleIngest = async () => {
    const token = window.localStorage.getItem('token');
    try {
      setStatus('Loading city hospital dataset...');
      const response = await axios.post(
        `${API_BASE}/api/hospitals/ingest-city`,
        { city },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setStatus(`Success: ${response.data.message}`);
    } catch (error) {
      setStatus(error.response?.data?.error || 'Admin action failed.');
    }
  };

  const updateHospital = async (e) => {
    e.preventDefault();
    const token = window.localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/api/admin/hospitals/${hospitalForm.id}`, hospitalForm, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setStatus('Hospital updated successfully.');
    } catch (error) {
      setStatus(error.response?.data?.error || 'Update failed.');
    }
  };

  const updateDoctor = async (e) => {
    e.preventDefault();
    const token = window.localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/api/admin/doctors/${doctorForm.id}`, doctorForm, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setStatus('Doctor updated successfully.');
    } catch (error) {
      setStatus(error.response?.data?.error || 'Update failed.');
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Toolkit</p>
          <h1>Hospital ingestion and hospital / doctor management</h1>
        </div>
      </div>
      <div className="card-grid">
        <div className="admin-card">
          <h2>Dynamic Data Ingestion</h2>
          <p>Import hospitals from Google Places for new cities using the ingestion API.</p>
          <label>City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city name" />
          <button onClick={handleIngest} className="button button-primary">Ingest city data</button>
        </div>
        <div className="admin-card">
          <h2>Update Hospital</h2>
          <form onSubmit={updateHospital}>
            <input value={hospitalForm.id} onChange={(e) => setHospitalForm({ ...hospitalForm, id: e.target.value })} placeholder="Hospital ID" required />
            <input value={hospitalForm.name} onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })} placeholder="Name" />
            <input value={hospitalForm.address} onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })} placeholder="Address" />
            <input value={hospitalForm.phone} onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })} placeholder="Phone" />
            <button type="submit" className="button button-primary">Update Hospital</button>
          </form>
        </div>
        <div className="admin-card">
          <h2>Update Doctor</h2>
          <form onSubmit={updateDoctor}>
            <input value={doctorForm.id} onChange={(e) => setDoctorForm({ ...doctorForm, id: e.target.value })} placeholder="Doctor ID" required />
            <input value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} placeholder="Name" />
            <input value={doctorForm.specialization} onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} placeholder="Specialization" />
            <input value={doctorForm.fee} onChange={(e) => setDoctorForm({ ...doctorForm, fee: e.target.value })} placeholder="Fee" type="number" />
            <button type="submit" className="button button-primary">Update Doctor</button>
          </form>
        </div>
      </div>
      <div className="form-message">{status}</div>
    </section>
  );
}
