import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', borderRadius: '24px' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ width: '100px', height: '14px', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ width: '60px', height: '10px', borderRadius: '4px' }}></div>
          </div>
        </div>
        <div className="skeleton" style={{ width: '70px', height: '28px', borderRadius: '14px' }}></div>
      </div>

      {/* Image Skeleton */}
      <div className="skeleton" style={{ width: '100%', height: '240px', borderRadius: '16px' }}></div>
      
      {/* Content Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: '60%', height: '20px' }}></div>
          <div className="skeleton" style={{ width: '20%', height: '20px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '100%', height: '12px' }}></div>
        <div className="skeleton" style={{ width: '80%', height: '12px' }}></div>
      </div>
      
      {/* Footer Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ width: '100px', height: '14px' }}></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <div className="skeleton" style={{ width: '18px', height: '18px', borderRadius: '4px' }}></div>
           <div className="skeleton" style={{ width: '18px', height: '18px', borderRadius: '4px' }}></div>
           <div className="skeleton" style={{ width: '18px', height: '18px', borderRadius: '4px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
