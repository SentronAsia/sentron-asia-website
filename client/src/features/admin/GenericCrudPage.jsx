import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiPlus, HiPencilSquare, HiTrash, HiXMark } from 'react-icons/hi2';
import ImageUploadField from '../../components/admin/ImageUploadField.jsx';
import MultiImageUploadField from '../../components/admin/MultiImageUploadField.jsx';

/**
 * GenericCrudPage — Reusable CRUD table with create/edit modal and delete confirmation.
 *
 * Props:
 *   title        — Page title
 *   queryKey     — React Query key
 *   fetchFn      — () => data
 *   createFn     — (data) => result
 *   updateFn     — (id, data) => result
 *   deleteFn     — (id) => result
 *   columns      — [{ key, label, render? }]
 *   formFields   — [{ key, label, type, placeholder?, required?, options? }]
 *   getItemId    — (item) => id
 *   defaultForm  — {} default form state
 */
export default function GenericCrudPage({
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
}) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dirty, setDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchFn,
  });

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
      <div className="admin-page-header">
        <h1 style={{ fontSize: '1.5rem' }}>{title}</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <HiPlus /> Add New
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="admin-table-wrapper glass-card-light" style={{ overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.length > 0 ? (
                data.data.map((item) => (
                  <tr key={getItemId(item)}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(item)} aria-label="Edit">
                          <HiPencilSquare />
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteConfirm(item)} aria-label="Delete">
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                    No items found. Click "Add New" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              {formFields.map((field) => {
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
