import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>📚 Library MS</span>
      <div style={styles.links}>
        {user?.role === 'admin' && <Link style={styles.link} to="/">Dashboard</Link>}
        <Link style={styles.link} to="/books">Books</Link>
        {user?.role === 'admin' && <>
          <Link style={styles.link} to="/members">Members</Link>
          <Link style={styles.link} to="/borrows">Borrows</Link>
        </>}
        <Link style={styles.link} to="/fines">Fines</Link>
        <Link style={styles.link} to="/inbox">Inbox</Link>
        <Link style={styles.link} to="/profile">Profile</Link>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background:'#1a73e8', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  brand: { color:'#fff', fontWeight:'bold', fontSize:18 },
  links: { display:'flex', gap:16, alignItems:'center' },
  link: { color:'#fff', textDecoration:'none', fontSize:14 },
  logout: { background:'#fff', color:'#1a73e8', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontWeight:'bold' }
};