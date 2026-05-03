import Link from 'next/link';

export default function HospitalCard({ hospital }) {
  const ratingValue = Number(hospital.rating);
  const ratingDisplay = !Number.isNaN(ratingValue) ? ratingValue.toFixed(1) : 'N/A';

  return (
    <article className="hospital-card">
      <div className="hospital-header">
        <div>
          <h3>{hospital.name}</h3>
          <p>{hospital.city}{hospital.state ? `, ${hospital.state}` : ''}</p>
        </div>
        <span className="badge">{ratingDisplay}</span>
      </div>
      <p>{hospital.address}</p>
      <div className="hospital-meta">
        <span>{hospital.emergency ? '24x7 Emergency' : 'General Care'}</span>
        <span>{hospital.specializations?.slice(0, 3).join(', ') || 'Multiple specialties'}</span>
      </div>
      <div className="hospital-actions">
        <Link href={`/hospital/${hospital.id}`} className="button button-primary">View details</Link>
      </div>
    </article>
  );
}
