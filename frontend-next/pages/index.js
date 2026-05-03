import Link from 'next/link';
import LandingFeature from '../components/LandingFeature';

export default function Home() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Smart Healthcare Discovery</p>
        <h1>Find trusted hospitals, top doctors, and secure appointments faster.</h1>
        <p className="hero-text">Vaidya Health combines intelligent search, real-time availability, and admin workflows for a modern healthcare booking experience.</p>
        <div className="hero-actions">
          <Link href="/search" className="button button-primary">Search hospitals</Link>
          <Link href="/doctors" className="button button-secondary">Browse doctors</Link>
        </div>
      </div>
      <div className="hero-panel">
        <div className="stats-card">
          <div className="stat"><strong>12k+</strong><span>Hospitals indexed</span></div>
          <div className="stat"><strong>18k+</strong><span>Doctor profiles</span></div>
          <div className="stat"><strong>9.8/10</strong><span>Average patient rating</span></div>
        </div>
      </div>
      <div className="features-grid">
        <LandingFeature icon="🔎" title="Intelligent Search" description="Fuzzy search with typo tolerance, synonyms, and geo-aware ranking." />
        <LandingFeature icon="🩺" title="Doctor Database" description="Find specialists, consult fees, experience, and availability all in one place." />
        <LandingFeature icon="⚡" title="Fast Appointments" description="Book secure consultation slots with real-time slot safety and transaction locking." />
        <LandingFeature icon="📈" title="Admin Controls" description="Ingest new city data, manage hospitals and doctors, and maintain your healthcare network." />
      </div>
      <div className="grid-callout">
        <div>
          <h2>Full platform workflow</h2>
          <p>From dynamic hospital ingestion to doctor onboarding, appointment booking, and administrative control, Vaidya Health is built for scale and patient trust.</p>
        </div>
        <div className="callout-actions">
          <Link href="/admin" className="button button-primary">Admin toolkit</Link>
          <Link href="/appointments" className="button button-secondary">Book appointment</Link>
        </div>
      </div>
    </section>
  );
}
