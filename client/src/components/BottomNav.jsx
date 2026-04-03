import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, PlusCircle, MessageSquare, User as UserIcon } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const activeTab = (path) => {
    if (path === 'dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="glass mobile-nav" style={{ 
      position: 'fixed', 
      bottom: '1.5rem', 
      left: '1.5rem', 
      right: '1.5rem', 
      height: '74px', 
      display: 'none', 
      alignItems: 'center', 
      justifyContent: 'space-around', 
      zIndex: 2000,
      border: '1px solid var(--border-hover)',
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(24px)',
      borderRadius: '24px',
      boxShadow: 'var(--shadow-lg)',
      paddingBottom: '0'
    }}>
      <Link to="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: activeTab('dashboard') ? 'var(--primary)' : 'var(--text-dim)', transition: 'var(--transition)' }}>
        <Compass size={22} strokeWidth={activeTab('dashboard') ? 2.5 : 2} />
        <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.02em' }}>Explore</span>
      </Link>
      <Link to="/dashboard/add" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: activeTab('add') ? 'var(--primary)' : 'var(--text-dim)', transition: 'var(--transition)' }}>
        <PlusCircle size={22} strokeWidth={activeTab('add') ? 2.5 : 2} />
        <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.02em' }}>Sell</span>
      </Link>
      <Link to="/messages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: activeTab('messages') ? 'var(--primary)' : 'var(--text-dim)', transition: 'var(--transition)' }}>
        <MessageSquare size={22} strokeWidth={activeTab('messages') ? 2.5 : 2} />
        <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.02em' }}>Inbox</span>
      </Link>
      <Link to={`/profile/${user?._id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: activeTab('profile') ? 'var(--primary)' : 'var(--text-dim)', transition: 'var(--transition)' }}>
        <UserIcon size={22} strokeWidth={activeTab('profile') ? 2.5 : 2} />
        <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.02em' }}>Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav;
