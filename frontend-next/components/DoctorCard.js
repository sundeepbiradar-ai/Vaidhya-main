export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      <div>
        <h3>{doctor.name}</h3>
        <p>{doctor.specialization || 'Specialist'}</p>
        <p>{doctor.hospital_name}, {doctor.city}</p>
      </div>
      <div className="doctor-meta">
        <span>{doctor.years_experience || 0} yrs experience</span>
        <span>₹{doctor.consultation_fee || 'TBD'}</span>
      </div>
    </article>
  );
}
