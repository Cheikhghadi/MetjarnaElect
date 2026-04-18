import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      addToast(t('auth.account_created') || 'Compte créé ! Veuillez vérifier votre email.');
      navigate('/verify', { state: { email: formData.email } });
    } catch (err) {
      addToast(err.apiMessage || err.response?.data?.message || t('auth.error_generic') || 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '30%', height: '30%', background: 'var(--secondary)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }}></div>

      <div className="auth-card glass animate-fade">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            margin: '0 auto 1.25rem', 
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
          <h1 className="auth-title">{t('auth.register_title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
            {t('auth.register_subtitle')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.name')}</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder={t('auth.name_placeholder')}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('auth.creating') : t('auth.create_account')}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
          {t('auth.already_have')} <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>{t('auth.log_in_link')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
