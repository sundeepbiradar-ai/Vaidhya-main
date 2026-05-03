import { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function HospitalDetail({ hospital }) {
  const [booking, setBooking] = useState({ doctor_id: '', appointment_date: '', slot: '', consultation_type: 'online' });
  const [message, setMessage] = useState('');

  if (!hospital) {
    return <section className="page-section"><h1>Hospital not found</h1><p>Please return to search and try again.</p></section>;
  }

  const handleBook = async (e) => {
    e.preventDefault();
    const token = window.localStorage.getItem('token');
    try {
      await axios.post(
        `${API_BASE}/api/appointments`,
        { ...booking, hospital_id: hospital.id },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setMessage('Appointment requested. Check your email or profile for confirmation.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Booking failed. Please login or try another slot.');
    }
  };

  const ratingValue = Number(hospital.rating);
  const ratingDisplay = !Number.isNaN(ratingValue) ? `${ratingValue.toFixed(1)} ★` : 'No rating yet';

  return (
    <section className="page-section">
      <div className="hospital-hero">
        <div>
          <p className="eyebrow">Hospital profile</p>
          <h1>{hospital.name}</h1>
          <p className="hero-text">{hospital.address}</p>
          <div className="hospital-badges">
            <span>{hospital.city}{hospital.state ? `, ${hospital.state}` : ''}</span>
            <span>{ratingDisplay}</span>
            <span>{hospital.emergency ? '24x7 Emergency' : 'Scheduled care'}</span>
          </div>
        </div>
        <div className="hospital-summary-card">
          <h2>Quick actions</h2>
          <p>Book a visit, review top doctors, and see available service filters.</p>
          <a href={hospital.website_url || '#'} target="_blank" rel="noreferrer" className="button button-secondary">Visit website</a>
        </div>
      </div>
      <div className="hospital-grid">
        <div className="hospital-panel">
          <h2>Specializations</h2>
          <p>{hospital.specializations?.join(', ') || 'General healthcare services'}</p>
          <h2>Insurance partners</h2>
          <p>{hospital.insurance_partners?.join(', ') || 'Standard insurance accepted'}</p>
          <h2>About this hospital</h2>
          <p>{hospital.description || 'Comprehensive care and doctor network across key specialties.'}</p>
          <h3>Doctors</h3>
          {hospital.doctors?.length ? (
            <ul className="doctor-list">
              {hospital.doctors.map((doctor) => (
                <li key={doctor.id}>
                  <strong>{doctor.name}</strong> · {doctor.specialization} · ₹{doctor.fee || 'TBD'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No doctor profiles available yet.</p>
          )}
        </div>
        <aside className="booking-panel">
          <h2>Book a consultation</h2>
          <form onSubmit={handleBook} className="form-card">
            <label>Doctor ID</label>
            <input type="text" value={booking.doctor_id} onChange={(e) => setBooking({ ...booking, doctor_id: e.target.value })} placeholder="Doctor ID" />
            <label>Appointment date</label>
            <input type="date" value={booking.appointment_date} onChange={(e) => setBooking({ ...booking, appointment_date: e.target.value })} />
            <label>Slot</label>
            <input type="text" value={booking.slot} onChange={(e) => setBooking({ ...booking, slot: e.target.value })} placeholder="10:00 AM" />
            <label>Consultation type</label>
            <select value={booking.consultation_type} onChange={(e) => setBooking({ ...booking, consultation_type: e.target.value })}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <button type="submit" className="button button-primary">Request booking</button>
          </form>
          {message && <div className="form-message">{message}</div>}
          <p className="muted">Use the profile token from login to book with your account.</p>
        </aside>
      </div>
    </section>
  );
}

export async function getServerSideProps(ctx) {
  const { id } = ctx.params;
  try {
    const response = await axios.get(`${API_BASE}/api/hospitals/${id}`);
    return { props: { hospital: response.data.hospital } };
  } catch (error) {
    return { props: { hospital: null } };
  }
}
