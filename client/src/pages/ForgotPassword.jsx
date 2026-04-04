import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Un code de récupération a été envoyé à votre email.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.apiMessage || err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '30%', height: '30%', background: 'var(--secondary)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }}></div>
      
      <div className="auth-card glass animate-fade" style={{ maxWidth: '420px', padding: '3rem', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 1.25rem', borderRadius: '14px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.5rem', boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)' }}>Z</div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Récupération<span style={{ color: 'var(--primary)' }}>.</span></h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500' }}>
            Entrez votre email pour recevoir un code
          </p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-main)', opacity: 0.8 }}>Email associé</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="votre@email.com"
              style={{ height: '52px', borderRadius: '12px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: '52px', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le code'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
