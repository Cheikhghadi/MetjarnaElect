import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { User as UserIcon, Camera, Save, ArrowLeft } from 'lucide-react';

const EditProfile = () => {
  const [formData, setFormData] = useState({ name: '', avatar: '', bio: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // If in mock mode or similar, we might need a real fetch
          const { data } = await api.get(`/auth/profile/${user._id}`);
          setFormData({
            name: data.user.name || '',
            avatar: data.user.avatar || '',
            bio: data.user.bio || '',
            whatsapp: data.user.whatsapp || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile', err);
        addToast(t('profile.loading_error'), 'error');
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      localStorage.setItem('user', JSON.stringify(data));
      window.dispatchEvent(new Event('userStateChange'));
      addToast(t('profile.update_success'));
      navigate(`/profile/${data._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || t('profile.update_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return addToast(t('profile.image_limit'), 'error');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (fetching) return <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>{t('profile.loading')}</div>;

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '5rem', maxWidth: '600px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginBottom: '2rem', fontWeight: '700' }}
      >
        <ArrowLeft size={18} /> {t('profile.back')}
      </button>

      <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif", marginBottom: '2rem' }}>{t('profile.edit')}</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
            <label htmlFor="avatar-upload" style={{ cursor: 'pointer', position: 'relative' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '32px', 
                background: 'var(--secondary)', 
                border: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)'
              }}>
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={48} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                )}
              </div>
              <div style={{ 
                position: 'absolute', 
                bottom: '-10px', 
                right: '-10px', 
                width: '40px', 
                height: '40px', 
                background: 'var(--primary)', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                border: '4px solid var(--bg-color)'
              }}>
                <Camera size={18} />
              </div>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.name')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.bio_label')}</label>
            <textarea 
              className="form-input"
              rows="3"
              style={{ resize: 'none' }}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder={t('profile.bio_placeholder')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.whatsapp_label')}</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: +222..."
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            {loading ? t('profile.saving') : (
              <>
                <Save size={20} />
                {t('profile.save')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
