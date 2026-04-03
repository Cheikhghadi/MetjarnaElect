import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '90px', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 3000 }}>
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="glass animate-slide-up"
            style={{ 
              padding: '1rem 1.25rem', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              minWidth: '280px',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              background: 'rgba(15, 15, 20, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {toast.type === 'error' ? <AlertCircle size={20} color="#ef4444" /> : <CheckCircle2 size={20} color="#10b981" />}
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
