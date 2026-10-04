import { useQuery } from '@tanstack/react-query';
import ContentManager from '../../features/admin/ContentManager.jsx';
import {
  adminFetchProducts, adminCreateProduct,
  adminUpdateProduct, adminDeleteProduct,
  adminFetchCategories, adminFetchBrands,
} from '../../api/services';

const columns = [
  {
    key: 'image', label: '',
    render: (item) => item.images?.[0]
      ? <img src={item.images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
      : <div style={{ width: 48, height: 48, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }} />,
  },
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'category', label: 'Category', render: (item) => item.category?.name || '–' },
  { key: 'brand', label: 'Brand', render: (item) => item.brand?.name || '–' },
  { key: 'isFeatured', label: 'Featured', render: (item) => item.isFeatured ? '✓' : '–' },
];

export default function ProductsManager() {
  const { data: categoriesData } = useQuery({ queryKey: ['admin-categories'], queryFn: adminFetchCategories });
  const { data: brandsData } = useQuery({ queryKey: ['admin-brands'], queryFn: adminFetchBrands });

  const categoryOptions = categoriesData?.data?.map(c => ({ value: c._id, label: c.name })) || [];
  const brandOptions = brandsData?.data?.map(b => ({ value: b._id, label: b.name })) || [];

  const formFields = [
    { key: 'name', label: 'Product Name', required: true },
    { key: 'slug', label: 'Slug', placeholder: 'auto-generated if empty' },
    { key: 'images', label: 'Product Images', type: 'multi-image' },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'categoryId', label: 'Category', type: 'select', required: true, options: categoryOptions },
    { key: 'brandId', label: 'Brand', type: 'select', options: brandOptions },
    { key: 'isFeatured', label: 'Featured', type: 'select', options: [
      { value: 'false', label: 'No' },
      { value: 'true', label: 'Yes' },
    ]},
  ];

  return (
    <ContentManager
      title="Products"
      queryKey="admin-products"
      fetchFn={adminFetchProducts}
      createFn={adminCreateProduct}
      updateFn={adminUpdateProduct}
      deleteFn={adminDeleteProduct}
      columns={columns}
      formFields={formFields}
      defaultForm={{ name: '', slug: '', images: [], description: '', categoryId: '', brandId: '', isFeatured: 'false' }}
    />
  );
}
