import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Discover from './tabs/Discover';
import Following from './tabs/Following';
import AddProduct from './tabs/AddProduct';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const activeTab = (path) => location.pathname.includes(path);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <main className="container" style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/suivi" element={<Following />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/edit/:id" element={<AddProduct />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
