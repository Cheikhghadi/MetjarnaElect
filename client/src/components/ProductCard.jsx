import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Star, 
  MessageSquare, 
  Repeat, 
  Heart, 
  Package, 
  User as UserIcon,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  Send,
  Edit2,
  Trash2
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const ProductCard = ({ product }) => {
  const [rating, setRating] = useState(Number(product.avgRating) || 0);
  const [isFollowing, setIsFollowing] = useState(product.isFollowing || false);
  const [liked, setLiked] = useState(product.isLiked || false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const sellerId = product.seller?._id || product.seller;
  const sellerName = product.seller?.name || 'Vendeur';

  useEffect(() => {
    const handleUserChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('userStateChange', handleUserChange);
    return () => window.removeEventListener('userStateChange', handleUserChange);
  }, []);

  // Social status is now provided by the backend in the product object
  useEffect(() => {
    setIsFollowing(product.isFollowing || false);
    setLiked(product.isLiked || false);
    setRating(Number(product.avgRating) || 0);
  }, [product.isFollowing, product.isLiked, product.avgRating]);

  const handleRate = async (stars) => {
    if (!user) return addToast('Connectez-vous pour noter', 'error');
    try {
      const { data } = await api.post(`/ratings/${product._id}`, { stars });
      setRating(data.avgRating);
      addToast('Note enregistrée !');
    } catch (err) {
      addToast('Erreur lors de la notation', 'error');
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/follow/${sellerId}`);
      setIsFollowing(data.following);
    } catch (err) {
      addToast('Erreur lors du suivi', 'error');
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/likes/${product._id}`);
      setLiked(data.liked);
      addToast(data.message, 'success');
    } catch (err) {
      addToast('Erreur lors de la réaction', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${product._id}`);
      addToast('Produit supprimé !');
      // If we are on search/discover, maybe just filter it out or reload
      window.location.reload();
    } catch (err) {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = product.status === 'sold' ? 'active' : 'sold';
      await api.put(`/products/${product._id}`, { status: newStatus });
      addToast(`Produit marqué comme ${newStatus === 'sold' ? 'vendu' : 'en vente'} !`, 'success');
      window.location.reload();
    } catch (err) {
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const isOwner = user && sellerId === user._id;

  return (
    <div className="glass animate-fade" style={{ 
      padding: '1.25rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)',
      background: 'var(--card-bg)',
      overflow: 'hidden'
    }} 
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px)';
      e.currentTarget.style.borderColor = 'var(--border-hover)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      const img = e.currentTarget.querySelector('.product-img');
      if (img) img.style.transform = 'scale(1.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      const img = e.currentTarget.querySelector('.product-img');
      if (img) img.style.transform = 'scale(1)';
    }}
    >
      {/* Social Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          onClick={() => navigate(`/profile/${sellerId}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.25rem', 
            zIndex: 1
          }}>
            {product.seller?.avatar ? <img src={product.seller.avatar} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : <UserIcon size={20} style={{ color: 'var(--primary)', opacity: 0.5 }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>{sellerName}</p>
              {product.seller?.role === 'admin' && (
                <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
              )}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{product.seller?.followersCount || 0} {t('product.followers')}</p>
          </div>
        </div>
        
        {user && sellerId !== user._id && (
          <button 
            onClick={handleFollow}
            style={{ 
              padding: '0.4rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: '700',
              background: isFollowing ? 'rgba(255,255,255,0.05)' : 'var(--text-main)',
              color: isFollowing ? 'var(--text-main)' : 'var(--bg-color)',
              border: isFollowing ? '1px solid var(--border)' : 'none'
            }}
          >
            {isFollowing ? t('product.following') : t('product.follow')}
          </button>
        )}
      </div>

      {/* Product Image Area */}
      <div style={{ 
        width: '100%', 
        height: '240px', 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0b0b12 100%)', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {(() => {
          const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
          return images.length > 0 ? (
            <>
              <img src={images[currentImgIndex]} alt={product.name} className="product-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e1b4b/8b5cf6?text=Image+Indisponible'; }} />
              {images.length > 1 && (
                <div style={{ position: 'absolute', bottom: '10px', display: 'flex', gap: '6px', zIndex: 2 }}>
                  {images.map((_, i) => (
                    <div 
                      key={i} 
                      onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(i); }} 
                      style={{ 
                        width: i === currentImgIndex ? '16px' : '6px', 
                        height: '6px', 
                        borderRadius: '10px', 
                        background: i === currentImgIndex ? 'var(--primary)' : 'rgba(255,255,255,0.5)', 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Package size={80} strokeWidth={1} style={{ color: 'var(--primary)', opacity: 0.3, filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))' }} />
          );
        })()}
        {product.delivery === 0 && (
          <span style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--success)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em', zIndex: 15 }}>
            {t('product.free_shipping')}
          </span>
        )}
        {product.status === 'sold' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <span style={{ transform: 'rotate(-15deg)', background: 'var(--error)', color: 'white', padding: '10px 30px', borderRadius: '8px', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.1em', border: '3px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              {t('product.sold')}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{product.name}</h3>
          <div style={{ textAlign: 'right' }}>
            <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '1000', fontFamily: "'Outfit', sans-serif" }}>
              {product.price}<span style={{ fontSize: '0.85rem', marginLeft: '2px', fontWeight: '700' }}>€</span>
            </p>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>
      </div>
      
      {/* Interaction Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <Star 
              key={star} 
              size={18}
              aria-label={`rate-${star}-stars`}
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  addToast('Connectez-vous pour noter', 'error');
                } else if (user._id === sellerId) {
                  addToast('Impossible de noter votre propre article', 'info');
                } else {
                  handleRate(star);
                }
              }}
              fill={star <= Math.round(rating) ? 'var(--primary)' : 'transparent'}
              style={{ cursor: 'pointer', color: star <= Math.round(rating) ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
            />
          ))}
          <span style={{ display: 'inline-block', marginLeft: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {typeof rating === 'number' ? rating.toFixed(1) : '0.0'}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <button 
            onClick={() => navigate(`/messages?user=${sellerId}&product=${encodeURIComponent(product.name)}`)}
            style={{ background: 'transparent', color: 'var(--text-dim)', padding: 0, border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <MessageSquare size={16} />
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/product/${product._id}`);
              addToast(t('product.copied'));
            }}
            style={{ background: 'transparent', color: 'var(--text-dim)', padding: 0, border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <Repeat size={16} />
          </button>
          <button 
            onClick={handleLike}
            style={{ background: 'transparent', color: liked ? 'var(--error)' : 'var(--text-dim)', padding: 0, border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
          >
            <Heart size={16} fill={liked ? 'var(--error)' : 'transparent'} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {isOwner ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button 
                onClick={() => navigate(`/dashboard/edit/${product._id}`)}
                className="btn-secondary" 
                style={{ height: '46px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Edit2 size={18} style={{ marginRight: '8px' }} />
                {t('product.edit')}
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn-primary" 
                style={{ height: '46px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={18} style={{ marginRight: '8px' }} />
                {t('product.delete')}
              </button>
            </div>
            <button 
              onClick={handleToggleStatus}
              className="btn-secondary" 
              style={{ width: '100%', height: '46px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700', border: '1px solid var(--border)', background: product.status === 'sold' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)', color: product.status === 'sold' ? 'var(--success)' : 'var(--text-main)' }}
            >
              <Package size={18} style={{ marginRight: '8px' }} />
              {product.status === 'sold' ? t('product.sell_again') : t('product.mark_sold')}
            </button>
            <ConfirmModal 
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDelete}
              title="Supprimer l'article ?"
              message={`Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`}
              confirmText="Supprimer"
              cancelText="Annuler"
            />
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <a 
              href={`https://wa.me/${product.seller.whatsapp}`} 
              target="_blank" 
              rel="noreferrer"
              className="btn-primary" 
              style={{ 
                height: '46px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '700',
                pointerEvents: product.status === 'sold' ? 'none' : 'auto',
                opacity: product.status === 'sold' ? 0.5 : 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <MessageCircle size={18} style={{ marginRight: '8px' }} />
              WhatsApp
            </a>
            <button 
              onClick={() => navigate(`/messages?user=${sellerId}&product=${encodeURIComponent(product.name)}`)}
              className="btn-primary" 
              style={{ 
                 height: '46px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
                 pointerEvents: product.status === 'sold' ? 'none' : 'auto',
                 opacity: product.status === 'sold' ? 0.5 : 1
              }}
            >
              <Send size={18} style={{ marginRight: '8px' }} />
              {t('product.direct')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
