import { X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const finalConfirmText = confirmText || t('common.confirm');
  const finalCancelText = cancelText || t('common.cancel');

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        padding: '1.5rem'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="glass animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(15, 15, 20, 0.95)',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '14px', 
            background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: type === 'danger' ? '#ef4444' : 'var(--primary)'
          }}>
            <AlertTriangle size={24} />
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem', fontFamily: "'Outfit', sans-serif" }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {message}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.75rem', borderRadius: '12px', fontWeight: '700' }}
          >
            {finalCancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn-primary"
            style={{ 
              padding: '0.75rem', 
              borderRadius: '12px', 
              fontWeight: '700',
              background: type === 'danger' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--primary)',
              boxShadow: type === 'danger' ? '0 10px 15px -3px rgba(239, 68, 68, 0.3)' : 'var(--shadow-md)'
            }}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
