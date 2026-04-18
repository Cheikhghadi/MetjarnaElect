import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

// Core Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import SetupProfile from './pages/SetupProfile';
import EditProfile from './pages/EditProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Route & Layout Component
const ProtectedLayout = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) return <Navigate to="/login" />;
  
  const user = JSON.parse(userStr);
  if (!user.name) return <Navigate to="/setup-profile" />;

  return (
    <div className="app-layout">
      <Navbar />
      {children}
      <BottomNav />
    </div>
  );
};

import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/setup-profile" element={<SetupProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes with Global Navbar */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedLayout>
                <Messages />
              </ProtectedLayout>
            } 
          />
          <Route 
            path="/profile/:id" 
            element={
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            } 
          />
          <Route 
            path="/edit-profile" 
            element={
              <ProtectedLayout>
                <EditProfile />
              </ProtectedLayout>
            } 
          />
          
          <Route 
            path="/dashboard/edit/:id" 
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
