import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import SkeletonCard from '../../components/SkeletonCard';
import { useLanguage } from '../../context/LanguageContext';

const Following = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFollowed = async () => {
      try {
        const { data } = await api.get('/products/followed');
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowed();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', paddingTop: '1rem' }}>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('following_tab.title')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>{t('following_tab.empty')}</p>
          <p style={{ marginTop: '1rem' }}>{t('following_tab.explore')}</p>
        </div>
      )}
    </div>
  );
};

export default Following;
