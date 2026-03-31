import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Inbox() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/requests/${id}`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating request');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Inbox</h2>
      {requests.length === 0 ? (
        <p>No messages/requests in your inbox.</p>
      ) : (
        <div style={styles.list}>
          {requests.map(req => (
            <div key={req._id} style={styles.card}>
              <div style={styles.cardInfo}>
                <p><strong>Book:</strong> {req.book?.title}</p>
                {user?.role === 'admin' && <p><strong>User:</strong> {req.user?.name} ({req.user?.email})</p>}
                <p>
                  <strong>Status:</strong> 
                  <span style={styles.badge(req.status)}>{req.status}</span>
                </p>
                <p><strong>Requested At:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
              
              {user?.role === 'admin' && req.status === 'Pending' && (
                <div style={styles.actions}>
                  <button style={styles.btnApprove} onClick={() => handleAction(req._id, 'Approved')}>Approve</button>
                  <button style={styles.btnReject} onClick={() => handleAction(req._id, 'Rejected')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 24, maxWidth: 800, margin: '0 auto' },
  list: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 },
  card: { background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: 6, margin: 0 },
  actions: { display: 'flex', gap: 8 },
  btnApprove: { background: '#4CAF50', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' },
  btnReject: { background: '#f44336', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' },
  badge: (status) => {
    let bg = '#ff9800'; // Pending
    let color = '#fff';
    if (status === 'Approved') bg = '#4CAF50';
    if (status === 'Rejected') bg = '#f44336';
    return {
      background: bg,
      color: color,
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginLeft: '8px'
    }
  }
};
