import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, form);
      window.localStorage.setItem('token', response.data.token);
      setMessage('Login successful!');
      router.push('/');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account Access</p>
          <h1>Login to your Vaidya Health account</h1>
        </div>
      </div>
      <div className="form-card">
        <form onSubmit={submit}>
          <label>Email address</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" className="button button-primary">Login</button>
        </form>
        {message && <div className="form-message">{message}</div>}
      </div>
    </section>
  );
}
