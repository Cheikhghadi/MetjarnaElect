import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const SetupProfile = () => {
  const [formData, setFormData] = useState({ name: '', avatar: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    // Check if user is already setup
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name) {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      localStorage.setItem('user', JSON.stringify(data));
      window.dispatchEvent(new Event('userStateChange'));
      addToast('Profil configuré avec succès !');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return addToast('L\'image doit faire moins de 2Mo', 'error');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '30%', height: '30%', background: 'var(--secondary)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }}></div>

      <div className="auth-card glass animate-fade" style={{ maxWidth: '420px', padding: '3rem', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Finaliser le profil</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500' }}>
            Dites-nous qui vous êtes
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label htmlFor="avatar-upload" style={{ cursor: 'pointer', position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2rem', color: 'var(--text-dim)' }}>+</span>
                )}
              </div>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Photo de profil (Optionnel)</span>
          </div>

          <div className="form-group">
            <label className="form-label">Nom complet (Obligatoire)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: Cheikh"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Numéro WhatsApp (Optionnel mais recommandé)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: 222..."
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading || !formData.name}>
            {loading ? 'Enregistrement...' : 'Commencer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;
