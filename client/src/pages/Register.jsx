import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      addToast('Compte créé ! Veuillez vérifier votre email.');
      navigate('/verify', { state: { email: formData.email } });
    } catch (err) {
      addToast(err.response?.data?.message || 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '30%', height: '30%', background: 'var(--secondary)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }}></div>

      <div className="auth-card glass animate-fade" style={{ maxWidth: '420px', padding: '3.5rem', zIndex: 1, border: '1px solid var(--border-hover)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            margin: '0 auto 1.5rem', 
            borderRadius: '16px', 
            background: 'var(--gradient)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: '900', 
            fontSize: '1.75rem', 
            boxShadow: '0 12px 30px rgba(139, 92, 246, 0.4)' 
          }}>Z</div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '1000', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '0.01em' }}>
            Join the exclusive ZenShop community
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem' }}>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="votre@email.com"
              style={{ height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem' }}>Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              style={{ height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: '54px', marginTop: '1.5rem', borderRadius: '16px', fontSize: '1.1rem', letterSpacing: '0.02em' }} disabled={loading}>
            {loading ? 'Creating Profile...' : 'Get Started'}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
