import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ books:0, members:0, borrows:0, fines:0 });
  const [overdue, setOverdue] = useState([]);
  const [genreData, setGenreData] = useState([]);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const [books, members, borrows, fines] = await Promise.all([
        api.get('/books'), api.get('/members'),
        api.get('/borrows/all'), api.get('/fines')
      ]);
      setStats({ books: books.data.length, members: members.data.length, borrows: borrows.data.filter(b => b.status === 'borrowed').length, fines: fines.data.filter(f => f.status === 'pending' || f.status === 'accruing').length });
      const overdueRes = await api.get('/borrows/overdue');
      setOverdue(overdueRes.data);
      const genreCount = {};
      books.data.forEach(b => { genreCount[b.genre] = (genreCount[b.genre] || 0) + b.borrowCount; });
      setGenreData(Object.entries(genreCount).map(([genre, count]) => ({ genre, count })));
    } catch (err) {
      console.error('Dashboard error:', err.response?.data || err.message);
    }
  };
  fetchData();
}, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Dashboard</h2>
      <div style={styles.statsGrid}>
        {[['📚 Total Books', stats.books], ['👥 Members', stats.members], ['📖 Borrows', stats.borrows], ['💰 Unpaid Fines', stats.fines]].map(([label, val]) => (
          <div key={label} style={styles.statCard}><h3>{val}</h3><p>{label}</p></div>
        ))}
      </div>

      <h3 style={styles.sectionTitle}>Genre Analytics</h3>
      <div style={{background:'#fff', borderRadius:12, padding:20, marginBottom:24}}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={genreData}>
            <XAxis dataKey="genre" /><YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1a73e8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 style={styles.sectionTitle}>Overdue Books ({overdue.length})</h3>
      <table style={styles.table}>
        <thead><tr>{['Member','Book','Due Date','Days Overdue'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>
          {overdue.map(b => (
            <tr key={b._id}>
              <td style={styles.td}>{b.user?.name}</td>
              <td style={styles.td}>{b.book?.title}</td>
              <td style={styles.td}>{new Date(b.dueDate).toLocaleDateString()}</td>
              <td style={styles.td}><span style={{color:'red', fontWeight:'bold'}}>{b.daysOverdue} days</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding:24, maxWidth:1100, margin:'0 auto' },
  title: { marginBottom:20, fontSize:24 },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  statCard: { background:'#fff', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', textAlign:'center' },
  sectionTitle: { marginBottom:12, fontSize:18 },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:12, overflow:'hidden' },
  th: { background:'#1a73e8', color:'#fff', padding:12, textAlign:'left' },
  td: { padding:12, borderBottom:'1px solid #eee' }
};