import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({ name:'', phone:'', address:'' });
  const [borrows, setBorrows] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
    if (user?.role !== 'admin') {
      api.get('/borrows/my').then(res => setBorrows(res.data)).catch(console.error);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await api.put('/auth/profile', form);
    login(res.data, token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={styles.container}>
      <h2 style={{marginBottom:20}}>My Profile</h2>
      <div style={styles.card}>
        <form onSubmit={handleSave}>
          <input style={styles.input} placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input style={styles.input} placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <input style={styles.input} placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <button style={styles.btn} type="submit">Save</button>
          {saved && <span style={{color:'green', marginLeft:12}}>✓ Saved!</span>}
        </form>
      </div>

      {user?.role !== 'admin' && (
        <>
          <h3 style={{marginBottom:12, marginTop:24}}>My Borrowing History</h3>
          <table style={styles.table}>
            <thead><tr>{['Book','Issue Date','Due Date','Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {borrows.map(b => (
                <tr key={b._id}>
                  <td style={styles.td}>{b.book?.title}</td>
                  <td style={styles.td}>{new Date(b.issueDate).toLocaleDateString()}</td>
                  <td style={styles.td}>{new Date(b.dueDate).toLocaleDateString()}</td>
                  <td style={styles.td}><span style={{color: b.status==='returned'?'green':'#1a73e8'}}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding:24, maxWidth:800, margin:'0 auto' },
  card: { background:'#fff', padding:24, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:16 },
  input: { width:'100%', padding:10, marginBottom:12, borderRadius:6, border:'1px solid #ddd', fontSize:14 },
  btn: { background:'#1a73e8', color:'#fff', border:'none', padding:'9px 18px', borderRadius:6, cursor:'pointer', fontWeight:'bold' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:12, overflow:'hidden' },
  th: { background:'#1a73e8', color:'#fff', padding:12, textAlign:'left' },
  td: { padding:12, borderBottom:'1px solid #eee' }
};