import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Image as ImageIcon, Upload, X, MessageCircle } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', price: '', delivery: 0, category: 'Autres', images: [] });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const fileInputRef = React.useRef();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user'));
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');

  useEffect(() => {
    if (id) {
       api.get(`/products/${id}`)
         .then(res => {
            const product = res.data;
            if (product) {
               setFormData({
                 name: product.name,
                 description: product.description,
                 price: product.price,
                 delivery: product.delivery,
                 category: product.category || 'Autres',
                 images: product.images || (product.image ? [product.image] : [])
               });
               if (product.images && product.images.length > 0) {
                 setPreviews(product.images);
               } else if (product.image) {
                 setPreviews([product.image]);
               }
            }
         })
         .catch(err => {
           console.error('Error fetching product to edit', err);
           addToast('Erreur lors de la récupération du produit', 'error');
         });
    }
  }, [id]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1200px
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to WebP or JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          resolve(dataUrl);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setLoading(true);
      try {
        const compressedB64s = await Promise.all(files.map(async file => {
          if (file.size > 5 * 1024 * 1024) {
             addToast('Certaines images sont volumineuses et seront compressées.', 'info');
          }
          return await compressImage(file);
        }));
        setPreviews([...previews, ...compressedB64s]);
        setFormData({ ...formData, images: [...formData.images, ...compressedB64s] });
      } catch (err) {
        addToast('Erreur lors du traitement d\'une image', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    setFormData({ ...formData, images: newImages });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) {
      addToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    
    // Ensure contact exists
    if (!whatsapp.trim()) {
      addToast('Le numéro WhatsApp est obligatoire pour contacter les acheteurs', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Update WhatsApp if changed
      if (whatsapp !== user?.whatsapp) {
        const { data } = await api.put('/auth/profile', { whatsapp });
        const updatedUser = { ...user, whatsapp: data.whatsapp };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userStateChange'));
      }

      // Format payload with proper numbers
      const payload = {
        ...formData,
        price: Number(formData.price),
        delivery: Number(formData.delivery) || 0
      };

      if (id) {
        await api.put(`/products/${id}`, payload);
        addToast('Produit mis à jour avec succès !');
      } else {
        await api.post('/products', payload);
        addToast('Produit mis en vente avec succès !');
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur lors de l'ajout du produit";
      if (err.response?.status === 413) {
        addToast("L'image est trop volumineuse pour le serveur.", 'error');
      } else {
        addToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="glass animate-fade" style={{ padding: '3.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <h2 className="text-gradient" style={{ marginBottom: '2rem', fontWeight: '1000', fontSize: '2.5rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
          {id ? t('add_product.title_edit') : t('add_product.title_add')}
        </h2>
        
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.03)', 
          border: '1px solid rgba(16, 185, 129, 0.15)', 
          padding: '1.5rem', 
          borderRadius: '20px', 
          marginBottom: '2.5rem',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <MessageCircle size={22} />
            </div>
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, fontWeight: '800' }}>{t('add_product.contact_title')}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0, marginTop: '2px', fontWeight: '500' }}>{t('add_product.contact_desc')}</p>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ex: +33 6... ou 222..."
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              style={{ border: '1px solid rgba(34, 197, 94, 0.4)', background: 'rgba(255, 255, 255, 0.02)' }}
              required
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload Area */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('add_product.gallery')}</label>
            <div 
              onClick={(e) => {
                if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'path' && e.target.tagName !== 'svg') {
                  fileInputRef.current?.click();
                }
              }}
              style={{
                width: '100%',
                minHeight: '260px',
                padding: '1.5rem',
                borderRadius: '24px',
                border: '2px dashed var(--border)',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
              }}
            >
              {previews.length > 0 ? (
                previews.map((prev, index) => (
                  <div key={index} className="glow-primary" style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={prev} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                  <div style={{ marginBottom: '1rem', color: 'var(--primary)', opacity: 0.8 }}><Upload size={48} /></div>
                  <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{t('add_product.add_images')}</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: '500' }}>{t('add_product.drop_images')}</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              multiple
              style={{ display: 'none' }} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('add_product.category')}</label>
            <select 
              className="form-input" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              style={{ WebkitAppearance: 'none' }}
            >
              <option value="Électronique">{t('cat.Électronique')}</option>
              <option value="Vêtements">{t('cat.Vêtements')}</option>
              <option value="Maison">{t('cat.Maison')}</option>
              <option value="Services">{t('cat.Services')}</option>
              <option value="Autres">{t('cat.Autres')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('add_product.name')}</label>
            <input 
              type="text" className="form-input" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('add_product.desc')}</label>
            <textarea 
              className="form-input" required rows="4" style={{ resize: 'none' }}
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('add_product.price_label')}</label>
              <input 
                type="number" className="form-input" required
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('add_product.delivery_label')}</label>
              <input 
                type="number" className="form-input"
                value={formData.delivery} onChange={e => setFormData({...formData, delivery: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? t('add_product.saving') : (id ? t('add_product.update') : t('add_product.publish'))}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
