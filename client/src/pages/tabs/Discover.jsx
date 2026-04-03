import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import SkeletonCard from '../../components/SkeletonCard';
import { Search, Filter, Sparkles } from 'lucide-react';

const Discover = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    delivery: '',
    category: 'Tous',
    page: 1
  });

  const categories = ['Tous', 'Électronique', 'Vêtements', 'Maison', 'Services', 'Autres'];

  const fetchProducts = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.name) params.append('name', currentFilters.name);
      if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.delivery) params.append('delivery', currentFilters.delivery);

      if (currentFilters.category && currentFilters.category !== 'Tous') params.append('category', currentFilters.category);
      params.append('page', currentFilters.page || 1);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      if (data.totalPages) setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const name = query.get('name') || '';
    if (name) {
      const newFilters = { ...filters, name };
      setFilters(newFilters);
      fetchProducts(newFilters);
    } else {
      fetchProducts();
    }
  }, [window.location.search]);

  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setFilters(prev => ({...prev, page: 1}));
    fetchProducts({...filters, page: 1});
  };

  const handleCategoryClick = (cat) => {
    const newFilters = { ...filters, category: cat, page: 1 };
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newFilters = { ...filters, page: newPage };
      setFilters(newFilters);
      fetchProducts(newFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ position: 'relative', marginBottom: '3rem', padding: '2.5rem 0' }}>
        <div style={{ 
          position: 'absolute', 
          top: '-20px', 
          left: '-20px', 
          width: '150px', 
          height: '150px', 
          background: 'var(--primary)', 
          opacity: 0.1, 
          filter: 'blur(80px)', 
          pointerEvents: 'none' 
        }}></div>
        
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '3rem', fontWeight: '1000', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
          Explore <span className="text-gradient">ZenShop</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', fontWeight: '500' }}>
          Discover the most exclusive items and services from our premium community.
        </p>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '16px',
              whiteSpace: 'nowrap',
              fontWeight: '700',
              fontSize: '0.9rem',
              background: filters.category === cat ? 'var(--gradient)' : 'rgba(255,255,255,0.03)',
              color: filters.category === cat ? '#fff' : 'var(--text-main)',
              border: '1px solid',
              borderColor: filters.category === cat ? 'transparent' : 'var(--border)',
              boxShadow: filters.category === cat ? '0 8px 20px rgba(139, 92, 246, 0.25)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '2.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Nom du produit..."
              value={filters.name} 
              onChange={e => setFilters({...filters, name: e.target.value})}
              style={{ paddingLeft: '2.8rem', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Prix Min"
                value={filters.minPrice} 
                onChange={e => setFilters({...filters, minPrice: e.target.value})}
                style={{ width: '110px', paddingLeft: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}
              />
            </div>
            <div style={{ color: 'var(--text-dim)' }}>—</div>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Prix Max"
                value={filters.maxPrice} 
                onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                style={{ width: '110px', paddingLeft: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}
              />
            </div>
          </div>

          <select 
            className="form-input" 
            value={filters.delivery} 
            onChange={e => setFilters({...filters, delivery: e.target.value})}
            style={{ width: '140px', borderRadius: '12px', background: 'rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >
            <option value="">Livraison</option>
            <option value="free">Gratuite</option>
            <option value="paid">Payante</option>
          </select>

          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} />
            <span>Filtrer</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
          {products.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
              <div style={{ color: 'var(--text-dim)', opacity: 0.3, marginBottom: '1.5rem' }}><Search size={64} /></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>Oups ! Aucun article trouvé.</p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Essayez d'ajuster vos filtres pour voir plus de pépites.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem', gap: '1rem' }}>
          <button 
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="btn-secondary"
            style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', opacity: filters.page === 1 ? 0.5 : 1 }}
          >
            Précédent
          </button>
          <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
            Page {filters.page} sur {totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === totalPages}
            className="btn-primary"
            style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', opacity: filters.page === totalPages ? 0.5 : 1 }}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default Discover;
