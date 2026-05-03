import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!window.localStorage.getItem('token'));
  }, []);

  const logout = () => {
    window.localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="site-header">
      <div className="brand">Vaidya Health</div>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/search">Search</Link>
        <Link href="/doctors">Doctors</Link>
        <Link href="/appointments">Appointments</Link>
        <Link href="/appointments/me">My Appointments</Link>
        <Link href="/admin">Admin</Link>
        {isLoggedIn ? (
          <button onClick={logout} className="button button-secondary">Logout</button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
