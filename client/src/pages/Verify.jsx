import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const Verify = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);
  
  useEffect(() => {
    if (code.length === 6) {
      handleAutoSubmit(code);
    }
  }, [code]);

  const handleAutoSubmit = async (codeToSubmit) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify', { email, code: codeToSubmit });
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userStateChange'));
      }
      addToast('Vérification réussie !');
      navigate('/setup-profile');
    } catch (err) {
      addToast(err.apiMessage || err.response?.data?.message || 'Code invalide', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify', { email, code });
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userStateChange'));
      }
      addToast('Vérification réussie !');
      if (data.user && !data.user.name) {
        navigate('/setup-profile');
      } else {
        navigate('/setup-profile'); // Assuming everyone needs to setup name initially now
      }
    } catch (err) {
      addToast(err.apiMessage || err.response?.data?.message || 'Code invalide', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '30%', height: '30%', background: 'var(--secondary)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }}></div>

      <div className="auth-card glass animate-fade" style={{ maxWidth: '420px', padding: '3rem', zIndex: 1, textAlign: 'center' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 1.25rem', borderRadius: '14px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.5rem', boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)' }}>Z</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Vérification</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500' }}>
            Code envoyé à <strong style={{ color: 'var(--text-main)' }}>{email}</strong>
          </p>
        </div>
        
        {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Code à 6 chiffres</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="000000"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', marginBottom: '0.5rem' }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Mode Test : Entrez <strong>000000</strong> pour continuer
            </p>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
             <ResendButton email={email} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Vérification...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ResendButton = ({ email }) => {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { email });
      addToast('Un nouveau code a été envoyé !');
      setCooldown(60);
    } catch (err) {
      addToast(err.apiMessage || err.response?.data?.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleResend}
      disabled={cooldown > 0 || loading}
      style={{ 
        background: 'none', 
        border: 'none', 
        color: cooldown > 0 ? 'var(--text-dim)' : 'var(--primary)', 
        fontSize: '0.85rem', 
        fontWeight: '600', 
        cursor: cooldown > 0 ? 'default' : 'pointer',
        textDecoration: cooldown > 0 ? 'none' : 'underline'
      }}
    >
      {loading ? 'Envoi...' : cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : 'Je n\'ai pas reçu de code'}
    </button>
  );
};

export default Verify;
