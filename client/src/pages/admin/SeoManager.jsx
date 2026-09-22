import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminFetchPageSeo, adminUpdatePageSeo } from '../../api/services';

const PAGES = ['home', 'products', 'innovations', 'downloads', 'about', 'contact'];

export default function SeoManager() {
  const queryClient = useQueryClient();
  const [editPage, setEditPage] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', keywords: '' });

  const { data: seoData, isLoading } = useQuery({
    queryKey: ['admin-page-seo'],
    queryFn: adminFetchPageSeo,
  });

  const mutation = useMutation({
    mutationFn: ({ page, data }) => adminUpdatePageSeo(page, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page-seo'] });
      setEditPage(null);
    },
  });

  const openEdit = (page) => {
    const existing = seoData?.data?.find((s) => s.page === page);
    setForm({
      title: existing?.title || '',
      description: existing?.description || '',
      keywords: existing?.keywords || '',
    });
    setEditPage(page);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ page: editPage, data: form });
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page SEO</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Manage meta titles, descriptions, and keywords for each page.
      </p>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {PAGES.map((page) => {
            const seo = seoData?.data?.find((s) => s.page === page);
            return (
              <div key={page} className="glass-card-light" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ textTransform: 'capitalize', marginBottom: '0.25rem' }}>{page}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {seo?.title || 'No SEO configured'}
                    </p>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(page)}>Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editPage && (
        <div className="modal-backdrop" onClick={() => setEditPage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ textTransform: 'capitalize', marginBottom: '1rem' }}>Edit SEO — {editPage}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Meta Title</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Description</label>
                <textarea className="form-input form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Keywords</label>
                <input className="form-input" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="comma-separated" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditPage(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
