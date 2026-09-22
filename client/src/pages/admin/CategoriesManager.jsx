import ContentManager from '../../features/admin/ContentManager.jsx';
import {
  adminFetchCategories, adminCreateCategory,
  adminUpdateCategory, adminDeleteCategory,
} from '../../api/services';

const columns = [
  {
    key: 'image', label: '',
    render: (item) => item.image
      ? <img src={item.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
      : <div style={{ width: 40, height: 40, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }} />,
  },
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'description', label: 'Description', render: (item) => item.description?.substring(0, 60) || '–' },
  { key: 'order', label: 'Order' },
];

const formFields = [
  { key: 'name', label: 'Name', required: true, placeholder: 'e.g. Analytical Instruments' },
  { key: 'slug', label: 'Slug', placeholder: 'auto-generated if empty' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description' },
  { key: 'image', label: 'Category Image', type: 'image' },
  { key: 'order', label: 'Display Order', type: 'number', placeholder: '0' },
];

export default function CategoriesManager() {
  return (
    <ContentManager
      title="Categories"
      queryKey="admin-categories"
      fetchFn={adminFetchCategories}
      createFn={adminCreateCategory}
      updateFn={adminUpdateCategory}
      deleteFn={adminDeleteCategory}
      columns={columns}
      formFields={formFields}
      defaultForm={{ name: '', slug: '', description: '', image: '', order: 0 }}
    />
  );
}
