import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Compass, 
  Users, 
  PlusCircle, 
  MessageSquare, 
  User as UserIcon, 
  LogOut,
  Bell,
  Search,
  ShoppingCart,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')));

  const [notifications, setNotifications] = React.useState([]);
  const [showNotifs, setShowNotifs] = React.useState(false);

  React.useEffect(() => {
    const handleUserChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('userStateChange', handleUserChange);
    
    if (user) fetchNotifications();

    return () => {
      window.removeEventListener('userStateChange', handleUserChange);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const markAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(notifications.map(n => ({...n, read: true})));
    } catch (err) {
      console.error(err);
    }
  };

  const [searchQuery, setSearchQuery] = React.useState('');
 
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
 
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?name=${searchQuery.trim()}`);
    }
  };

  const activeTab = (path) => {
    if (path === 'dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.includes(path);
  };

  return (
    <nav className="nav">
      <div className="container nav-content" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem' }}>
        {/* Brand */}
        <Link to="/dashboard" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '12px', 
            background: 'var(--gradient)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: '900', 
            fontSize: '1.3rem', 
            boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)' 
          }}>Z</div>
          <span className="text-gradient" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-0.03em' }}>ZenShop</span>
        </Link>
 
        {/* Search & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Rechercher un article..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.6rem 1rem 0.6rem 2.8rem', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                transition: 'var(--transition)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-hover)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </form>
 
          <div className="nav-links" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Link to="/dashboard" className={`nav-link ${activeTab('dashboard') ? 'active' : ''}`} style={{ padding: '0.5rem 1.2rem', borderRadius: '12px' }}>
              <Compass size={18} />
              <span style={{ fontSize: '0.85rem' }}>Explore</span>
            </Link>
            <Link to="/dashboard/suivi" className={`nav-link ${activeTab('suivi') ? 'active' : ''}`} style={{ padding: '0.5rem 1.2rem', borderRadius: '12px' }}>
              <Users size={18} />
              <span style={{ fontSize: '0.85rem' }}>Following</span>
            </Link>
            <Link to="/dashboard/add" className={`nav-link ${activeTab('add') ? 'active' : ''}`} style={{ padding: '0.5rem 1.2rem', borderRadius: '12px' }}>
              <PlusCircle size={18} />
              <span style={{ fontSize: '0.85rem' }}>Sell</span>
            </Link>
            <Link to="/messages" className={`nav-link ${activeTab('messages') ? 'active' : ''}`} style={{ padding: '0.5rem 1.2rem', borderRadius: '12px' }}>
              <MessageSquare size={18} />
              <span style={{ fontSize: '0.85rem' }}>Messages</span>
            </Link>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="nav-user" style={{ gap: '1rem' }}>
          <button 
             onClick={toggleTheme}
             style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div style={{ position: 'relative' }}>
             <button 
               onClick={() => {
                 setShowNotifs(!showNotifs);
                 if (!showNotifs && notifications.some(n => !n.read)) markAsRead();
               }}
               style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
               <Bell size={20} />
             </button>
             {notifications.some(n => !n.read) && (
               <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', border: '2px solid var(--bg-color)' }}></span>
             )}

             {showNotifs && (
               <div className="glass animate-fade" style={{ position: 'absolute', top: '100%', right: 0, width: '320px', padding: '1rem', marginTop: '1rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', zIndex: 100 }}>
                 <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '800' }}>Notifications</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                   {notifications.length === 0 ? (
                     <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Aucune notification</p>
                   ) : (
                     notifications.map(n => (
                       <div key={n._id} style={{ padding: '0.75rem', background: n.read ? 'transparent' : 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                         <p style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.message}</p>
                         <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )}
          </div>
 
          <Link to={`/profile/${user?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', transition: 'var(--transition)' }}>
             <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--primary)', overflow: 'hidden' }}>
                {user?.avatar ? <img src={user.avatar} style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/8b5cf6/ffffff?text=U'; }} /> : <UserIcon size={16} />}
             </div>
             <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px' }}>
               <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>{user?.name?.split(' ')[0]}</p>
               <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)' }}></div>
                 <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pro Member</p>
               </div>
             </div>
          </Link>
 
          <button 
            onClick={logout} 
            className="btn-logout"
            style={{ 
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
