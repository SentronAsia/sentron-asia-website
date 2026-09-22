import ContentManager from '../../features/admin/ContentManager.jsx';
import {
  adminFetchBrands, adminCreateBrand,
  adminUpdateBrand, adminDeleteBrand,
} from '../../api/services';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  {
    key: 'logo', label: 'Logo',
    render: (item) => item.logo
      ? <img src={item.logo} alt={item.name} style={{ height: 32, objectFit: 'contain' }} />
      : '–',
  },
  { key: 'description', label: 'Description', render: (item) => item.description?.substring(0, 60) || '–' },
];

const formFields = [
  { key: 'name', label: 'Name', required: true, placeholder: 'e.g. Thermo Fisher' },
  { key: 'slug', label: 'Slug', placeholder: 'auto-generated if empty' },
  { key: 'logo', label: 'Brand Logo', type: 'image' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief brand description' },
];

export default function BrandsManager() {
  return (
    <ContentManager
      title="Brands"
      queryKey="admin-brands"
      fetchFn={adminFetchBrands}
      createFn={adminCreateBrand}
      updateFn={adminUpdateBrand}
      deleteFn={adminDeleteBrand}
      columns={columns}
      formFields={formFields}
      defaultForm={{ name: '', slug: '', logo: '', description: '' }}
    />
  );
}
