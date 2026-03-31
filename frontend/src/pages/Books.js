import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', author:'', genre:'', ISBN:'', quantity:1 });

  const fetchBooks = async () => {
    const res = await api.get('/books', { params: { search, genre } });
    setBooks(res.data);
  };

  useEffect(() => { fetchBooks(); }, [search, genre]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/books', { ...form, available: form.quantity });
      setShowForm(false);
      setForm({ title:'', author:'', genre:'', ISBN:'', quantity:1 });
      fetchBooks();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      await api.delete(`/books/${id}`);
      fetchBooks();
    }
  };

  const handleReserve = async (id) => {
    try { await api.post(`/books/${id}/reserve`); alert('Book reserved!'); }
    catch (err) { alert(err.response?.data?.message); }
  };

  const handleRequest = async (id) => {
    try {
      await api.post(`/books/${id}/request`);
      alert('Book requested successfully! Check your Inbox.');
      fetchBooks();
    } catch (err) { alert(err.response?.data?.message || 'Error requesting book'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Books</h2>
        {user?.role === 'admin' && <button style={styles.btn} onClick={() => setShowForm(!showForm)}>+ Add Book</button>}
      </div>

      <div style={styles.filters}>
        <input style={styles.input} placeholder="Search title, author, ISBN..." value={search} onChange={e => setSearch(e.target.value)} />
        <input style={styles.input} placeholder="Filter by genre..." value={genre} onChange={e => setGenre(e.target.value)} />
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          {['title','author','genre','ISBN'].map(f => (
            <input key={f} style={styles.input} placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
              value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} required />
          ))}
          <input style={styles.input} type="number" placeholder="Quantity" value={form.quantity}
            onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} required />
          <button style={styles.btn} type="submit">Save Book</button>
        </form>
      )}

      <div style={styles.grid}>
        {books.map(book => (
          <div key={book._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.bookTitle}>{book.title}</h3>
              {book.borrowCount > 5 && <span style={styles.badge}>🔥 Popular</span>}
            </div>
            <p style={styles.author}>by {book.author}</p>
            <p style={styles.meta}>Genre: {book.genre}</p>
            <p style={styles.meta}>ISBN: {book.ISBN}</p>
            <p style={styles.meta}>Available: <strong>{book.available}/{book.quantity}</strong></p>
            <div style={styles.cardActions}>
              {book.available === 0 && user?.role === 'member' &&
                <button style={styles.btnSmall} onClick={() => handleReserve(book._id)}>Reserve</button>}
              {book.available > 0 && user?.role === 'member' &&
                <button style={styles.btnSmall} onClick={() => handleRequest(book._id)}>Request Book</button>}
              {user?.role === 'admin' &&
                <button style={{...styles.btnSmall, background:'#e53935'}} onClick={() => handleDelete(book._id)}>Delete</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding:24, maxWidth:1100, margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  filters: { display:'flex', gap:12, marginBottom:16 },
  form: { background:'#fff', padding:20, borderRadius:12, marginBottom:20, display:'flex', flexWrap:'wrap', gap:10 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:16 },
  card: { background:'#fff', padding:16, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 },
  bookTitle: { fontSize:15, fontWeight:'bold' },
  author: { color:'#666', fontSize:13, marginBottom:6 },
  meta: { fontSize:13, color:'#444', marginBottom:4 },
  cardActions: { marginTop:10, display:'flex', gap:8 },
  badge: { background:'#fff3e0', color:'#e65100', fontSize:11, padding:'2px 6px', borderRadius:12, whiteSpace:'nowrap' },
  input: { padding:9, borderRadius:6, border:'1px solid #ddd', fontSize:14, flex:1, minWidth:160 },
  btn: { background:'#1a73e8', color:'#fff', border:'none', padding:'9px 18px', borderRadius:6, cursor:'pointer', fontWeight:'bold' },
  btnSmall: { background:'#1a73e8', color:'#fff', border:'none', padding:'5px 10px', borderRadius:6, cursor:'pointer', fontSize:12 }
};