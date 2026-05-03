import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      setMessage('Please login to view your appointments.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/appointments/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage('Failed to load appointments. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Appointment History</p>
          <h1>Your past and upcoming consultations</h1>
        </div>
      </div>
      {message && <div className="form-message">{message}</div>}
      {loading ? (
        <p>Loading appointments…</p>
      ) : (
        <div className="appointment-list">
          {appointments.length ? appointments.map((appt) => (
            <div key={appt.id} className="appointment-card">
              <div>
                <strong>Doctor ID: {appt.doctor_id}</strong> · Hospital ID: {appt.hospital_id}
              </div>
              <div>Date: {appt.appointment_date} · Slot: {appt.slot}</div>
              <div>Type: {appt.consultation_type} · Status: {appt.status}</div>
            </div>
          )) : <p>No appointments found.</p>}
        </div>
      )}
    </section>
  );
}
