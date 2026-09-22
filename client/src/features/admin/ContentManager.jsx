import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiPlus, HiPencilSquare, HiTrash, HiXMark, HiMagnifyingGlass, HiEllipsisVertical, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import ImageUploadField from '../../components/admin/ImageUploadField.jsx';
import MultiImageUploadField from '../../components/admin/MultiImageUploadField.jsx';

function ActionDropdown({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setOpen(false)}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)} aria-label="Actions">
        <HiEllipsisVertical />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', zIndex: 10,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '0.25rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
          minWidth: '120px', boxShadow: 'var(--shadow-md)'
        }}>
          <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => { setOpen(false); onEdit(); }}>
            <HiPencilSquare /> Edit
          </button>
          <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--color-danger)' }} onClick={() => { setOpen(false); onDelete(); }}>
            <HiTrash /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ContentManager({
  title,
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  columns,
  formFields,
  getItemId = (item) => item._id,
  defaultForm = {},
  renderForm, // Add renderForm prop
}) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dirty, setDirty] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchFn,
  });

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    if (!search) return data.data;
    const lowerSearch = search.toLowerCase();
    return data.data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setDeleteConfirm(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ ...defaultForm });
    setDirty(false);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const formData = {};
    formFields.forEach((field) => {
      formData[field.key] = item[field.key] ?? defaultForm[field.key] ?? '';
    });
    setForm(formData);
    setDirty(false);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    if (dirty && !confirm('You have unsaved changes. Discard?')) return;
    setModalOpen(false);
    setEditingItem(null);
    setDirty(false);
  }, [dirty]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: getItemId(editingItem), data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="admin-page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{title}</h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
            <HiMagnifyingGlass style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <HiPlus /> Add New
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="admin-table-wrapper glass-card-light" style={{ overflow: 'visible' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={getItemId(item)}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(item) : item[col.key]}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right' }}>
                        <ActionDropdown 
                          onEdit={() => openEditModal(item)}
                          onDelete={() => setDeleteConfirm(item)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                      {search ? 'No results match your search.' : 'No items found. Click "Add New" to create one.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredData.length)} of {filteredData.length} entries
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <HiChevronLeft />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setPage(i + 1)}
                    style={{ padding: '0.25rem 0.75rem' }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <HiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem' }}>{editingItem ? 'Edit' : 'Create'} {title.replace(/s$/, '')}</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><HiXMark /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {renderForm ? renderForm({ form, handleChange, setForm, editingItem }) : formFields.map((field) => {
                if (field.type === 'image') {
                  return (
                    <ImageUploadField
                      key={field.key}
                      label={field.label}
                      value={form[field.key] || ''}
                      onChange={(url) => handleChange(field.key, url)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  );
                }

                if (field.type === 'multi-image') {
                  return (
                    <MultiImageUploadField
                      key={field.key}
                      label={field.label}
                      values={Array.isArray(form[field.key]) ? form[field.key] : (form[field.key] ? [form[field.key]] : [])}
                      onChange={(urls) => handleChange(field.key, urls)}
                      maxFiles={field.maxFiles || 20}
                    />
                  );
                }

                return (
                  <div className="form-group" key={field.key}>
                    <label className="form-label" htmlFor={`field-${field.key}`}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={`field-${field.key}`}
                        className="form-input form-textarea"
                        value={form[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        id={`field-${field.key}`}
                        className="form-input"
                        value={form[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        required={field.required}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        id={`field-${field.key}`}
                        className="form-input"
                        value={form[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        id={`field-${field.key}`}
                        className="form-input"
                        value={form[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isMutating}>
                  {isMutating ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>

            {(createMutation.error || updateMutation.error) && (
              <p className="form-error" style={{ marginTop: '0.75rem' }}>
                {createMutation.error?.response?.data?.message || updateMutation.error?.response?.data?.message || 'An error occurred.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Confirm Delete</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => deleteMutation.mutate(getItemId(deleteConfirm))}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
