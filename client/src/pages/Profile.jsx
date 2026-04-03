import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { useToast } from '../context/ToastContext';
import { 
  User as UserIcon, 
  MessageSquare, 
  UserPlus, 
  Check, 
  Package, 
  Users, 
  TrendingUp,
  ShieldCheck,
  Settings
} from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const { addToast } = useToast();

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/auth/profile/${id}`);
      setProfile(data.user);
      setProducts(data.products);
      
      // Check if current user is following this profile
      if (currentUser && currentUser._id !== id) {
        const res = await api.get(`/follow/status/${id}`);
        setIsFollowing(res.data.following);
      }
    } catch (err) {
      console.error(err);
      addToast('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '120px' }}>
        <div className="glass" style={{ padding: '2.5rem', display: 'flex', gap: '2.5rem', marginBottom: '3rem' }}>
          <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%' }}></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ width: '200px', height: '32px' }}></div>
            <div className="skeleton" style={{ width: '150px', height: '20px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '60px' }}></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }
 
  if (!profile) return <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Profil introuvable</div>;

  return (
    <div className="container animate-fade" style={{ paddingTop: '120px', paddingBottom: '5rem' }}>
      {/* Profile Header */}
      <div className="glass" style={{ padding: '3rem', display: 'flex', flexWrap: 'wrap', gap: '3rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
        {/* Background Accent */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary)', opacity: 0.05, filter: 'blur(100px)', pointerEvents: 'none' }}></div>
 
        <div style={{ 
          width: '180px', 
          height: '180px', 
          borderRadius: '40px', 
          background: 'var(--secondary)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          zIndex: 2
        }}>
          {profile.avatar ? <img src={profile.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={80} style={{ color: 'var(--primary)', opacity: 0.5 }} />}
        </div>
        
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: '1000', fontFamily: "'Outfit', sans-serif" }}>{profile.name}</h1>
                {profile.role === 'admin' && <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500' }}>{profile.bio || `Premium member since ${new Date(profile.createdAt).getFullYear()}`}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {currentUser?._id === profile._id ? (
                <button 
                  onClick={() => navigate('/edit-profile')}
                  className="btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.75rem', borderRadius: '16px', fontWeight: '700' }}
                >
                  <Settings size={20} />
                  Manage Profile
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate(`/messages?user=${profile._id}`)}
                    className="btn-secondary" 
                    style={{ padding: '0.85rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '700' }}
                  >
                    <MessageSquare size={20} />
                    Message
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const { data } = await api.post(`/follow/${profile._id}`);
                        setIsFollowing(data.following);
                        addToast(data.following ? 'Following successfully!' : 'Unfollowed');
                      } catch (err) {
                        addToast('Error performing action', 'error');
                      }
                    }}
                    className="btn-primary" 
                    style={{ padding: '0.85rem 2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem' }}
                  >
                    {isFollowing ? <Check size={20} /> : <UserPlus size={20} />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
          </div>
 
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                 <Users size={14} />
                 <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Abonnés</span>
               </div>
               <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>{profile.followersCount}</p>
             </div>
             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                 <Package size={14} />
                 <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Articles</span>
               </div>
               <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>{products.length}</p>
             </div>
             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                 <TrendingUp size={14} />
                 <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ventes</span>
               </div>
               <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>12</p>
             </div>
          </div>
        </div>
      </div>

      {/* User's Products */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif", marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Package size={24} style={{ color: 'var(--primary)' }} />
        Boutique de {profile.name.split(' ')[0]}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
        {products.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
            Cet utilisateur n'a pas encore posté d'articles.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
