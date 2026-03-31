import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Borrows from './pages/Borrows';
import Fines from './pages/Fines';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/books" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Navbar /><AdminDashboard /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><Navbar /><Books /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute adminOnly><Navbar /><Members /></ProtectedRoute>} />
          <Route path="/borrows" element={<ProtectedRoute adminOnly><Navbar /><Borrows /></ProtectedRoute>} />
          <Route path="/fines" element={<ProtectedRoute><Navbar /><Fines /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><Navbar /><Inbox /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}