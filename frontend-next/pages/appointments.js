import { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function Appointments() {
  const [form, setForm] = useState({ doctor_id: '', hospital_id: '', appointment_date: '', slot: '', consultation_type: 'online' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const token = window.localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/appointments`, form, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setMessage('Appointment requested successfully.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to submit appointment.');
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Appointment Booking</p>
          <h1>Reserve consultation slots securely</h1>
        </div>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <label>Doctor ID</label>
          <input type="text" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} placeholder="Doctor ID" />
          <label>Hospital ID</label>
          <input type="text" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} placeholder="Hospital ID" />
          <label>Appointment Date</label>
          <input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
          <label>Slot</label>
          <input type="text" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} placeholder="10:00 AM" />
          <label>Consultation Type</label>
          <select value={form.consultation_type} onChange={(e) => setForm({ ...form, consultation_type: e.target.value })}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <button type="submit" className="button button-primary">Request Appointment</button>
        </form>
        {message && <div className="form-message">{message}</div>}
      </div>
      <p className="muted">Tip: login first to ensure appointment requests are linked to your profile.</p>
    </section>
  );
}
