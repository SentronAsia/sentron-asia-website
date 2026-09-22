import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiArrowDownTray, HiCheck } from 'react-icons/hi2';
import { adminFetchSettings, adminUpdateSettings, exportDatabase } from '../../api/services';

export default function SettingsManager() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    siteName: '',
    contactEmail: '',
    phoneNumbers: '',
    inquiryRouting: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminFetchSettings,
  });

  useEffect(() => {
    if (data?.data) {
      setForm({
        siteName: data.data.siteName || '',
        contactEmail: data.data.contactEmail || '',
        phoneNumbers: data.data.phoneNumbers || '',
        inquiryRouting: data.data.inquiryRouting || '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleExport = async () => {
    try {
      const response = await exportDatabase();
      // response is a blob because we passed { responseType: 'blob' }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'sentron-db-backup.json';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export database', error);
      alert('Failed to export database.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 style={{ fontSize: '1.5rem' }}>Site Settings</h1>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>
          <HiArrowDownTray /> Export Database
        </button>
      </div>

      <div className="glass-card-light" style={{ maxWidth: '600px', padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="siteName">Site Name</label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              className="form-input"
              value={form.siteName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contactEmail">Primary Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              className="form-input"
              value={form.contactEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phoneNumbers">Phone Numbers</label>
            <input
              type="text"
              id="phoneNumbers"
              name="phoneNumbers"
              className="form-input"
              value={form.phoneNumbers}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inquiryRouting">Inquiry Routing Email(s)</label>
            <input
              type="text"
              id="inquiryRouting"
              name="inquiryRouting"
              className="form-input"
              value={form.inquiryRouting}
              onChange={handleChange}
            />
            <p className="form-help" style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Email address where contact form submissions will be sent.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
            {updateMutation.isSuccess && (
              <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <HiCheck /> Saved
              </span>
            )}
          </div>
          
          {updateMutation.isError && (
            <p className="form-error">
              {updateMutation.error?.response?.data?.message || 'Failed to update settings.'}
            </p>
          )}

        </form>
      </div>
    </div>
  );
}
