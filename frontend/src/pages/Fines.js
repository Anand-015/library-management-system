import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Fines() {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);

  const fetchFines = async () => {
    const res = await api.get(user?.role === 'admin' ? '/fines' : '/fines/my');
    setFines(res.data);
  };

  useEffect(() => { fetchFines(); }, []);



  return (
    <div style={styles.container}>
      <h2 style={{marginBottom:16}}>Fines</h2>
      <table style={styles.table}>
        <thead><tr>{['Member','Amount','Days Overdue','Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>
          {fines.map(f => (
            <tr key={f._id}>
              <td style={styles.td}>{f.user?.name || 'You'}</td>
              <td style={styles.td}>₹{f.amount}</td>
              <td style={styles.td}>{f.daysOverdue} days</td>
              <td style={styles.td}><span style={{color: f.status==='paid'?'green': f.status==='waived'?'#1a73e8':'red'}}>{f.status}</span></td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding:24, maxWidth:1100, margin:'0 auto' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:12, overflow:'hidden' },
  th: { background:'#1a73e8', color:'#fff', padding:12, textAlign:'left' },
  td: { padding:12, borderBottom:'1px solid #eee' }
};