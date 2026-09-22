import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';
import { fetchProducts, fetchCategories, fetchBrands } from '../../api/services';

export default function ProductsPage() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const selectedCategory = categoryId || searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';

  const [searchInput, setSearchInput] = useState(query);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', { q: query, category: selectedCategory, brand: selectedBrand }],
    queryFn: () => fetchProducts({ q: query, category: selectedCategory, brand: selectedBrand }),
  });

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('q', searchInput);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasFilters = query || selectedCategory || selectedBrand;

  return (
    <>
      <SEOHead
        title="Products Catalogue"
        description="Browse our comprehensive range of scientific, laboratory, and analytical equipment. Filter by category and brand."
      />

      {/* Page Header */}
      <section className="products-page-header">
        <div className="container">
          <ScrollReveal>
            <h1>Products Catalogue</h1>
            <p>Explore our complete range of laboratory and analytical instruments.</p>
          </ScrollReveal>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="products-search" style={{ marginTop: '1.5rem', maxWidth: '480px' }}>
            <div style={{ position: 'relative' }}>
              <HiMagnifyingGlass style={{
                position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                width: '1.125rem', height: '1.125rem', color: 'var(--color-text-muted)'
              }} />
              <input
                type="search"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="form-input"
                id="product-search"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="products-layout">
            {/* Filters Sidebar */}
            <aside className="products-sidebar">
              {/* Categories */}
              <div className="filter-section">
                <h6 className="filter-title">Categories</h6>
                <div className="filter-pills">
                  {categories?.data?.map((cat) => (
                    <button
                      key={cat._id}
                      className={`filter-pill ${selectedCategory === cat._id ? 'filter-pill--active' : ''}`}
                      onClick={() => updateFilter('category', selectedCategory === cat._id ? '' : cat._id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="filter-section">
                <h6 className="filter-title">Brands</h6>
                <div className="filter-pills">
                  {brands?.data?.map((brand) => (
                    <button
                      key={brand._id}
                      className={`filter-pill ${selectedBrand === brand._id ? 'filter-pill--active' : ''}`}
                      onClick={() => updateFilter('brand', selectedBrand === brand._id ? '' : brand._id)}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="products-results">
              <div className="products-results-bar">
                <span className="results-count">
                  {isLoading ? 'Loading...' : `${products?.data?.length || 0} products found`}
                </span>
                {hasFilters && (
                  <button className="btn btn-ghost btn-sm" onClick={clearAllFilters}>
                    <HiXMark /> Clear Filters
                  </button>
                )}
              </div>

              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" />
                </div>
              ) : (
                <div className="products-grid">
                  {products?.data?.map((product, i) => (
                    <ScrollReveal key={product._id} delay={i * 60}>
                      <Link to={`/product/${product.slug}`} className="product-card glass-card-light-hover">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="product-card-image" loading="lazy" />
                        ) : (
                          <div className="product-card-image" style={{ background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>No Image</span>
                          </div>
                        )}
                        <div className="product-card-body">
                          <h4 className="product-card-name">{product.name}</h4>
                          {product.category?.name && (
                            <span className="product-card-category">{product.category.name}</span>
                          )}
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {!isLoading && products?.data?.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>No products found matching your criteria.</p>
                  {hasFilters && (
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={clearAllFilters}>
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
