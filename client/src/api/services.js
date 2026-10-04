import api from './axios';
import axios from 'axios';

export const uploadToCloudinary = async (file, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  });
  return res.data;
};


/* ============================
   PUBLIC API SERVICES
   ============================ */

// Products
export const fetchProducts = (params) => api.get('/products', { params }).then(r => r.data);
export const fetchProductBySlug = (slug) => api.get(`/products/${slug}`).then(r => r.data);
export const fetchFeaturedProducts = () => api.get('/products/featured').then(r => r.data);

// Categories
export const fetchCategories = () => api.get('/categories').then(r => r.data);
export const fetchCategoryById = (id) => api.get(`/categories/${id}`).then(r => r.data);

// Brands
export const fetchBrands = () => api.get('/brands').then(r => r.data);
export const fetchBrandById = (id) => api.get(`/brands/${id}`).then(r => r.data);

// Partners
export const fetchPartners = () => api.get('/partners').then(r => r.data);

// Showcase Stories
export const fetchShowcaseStories = (brandId) => api.get(`/showcase-stories/${brandId}`).then(r => r.data);

// Documents
export const fetchDocuments = (params) => api.get('/documents', { params }).then(r => r.data);
export const getDocumentDownloadUrl = (id) => api.get(`/documents/${id}/download`).then(r => r.data);

// Page SEO
export const fetchPageSeo = (page) => api.get(`/page-seo/${page}`).then(r => r.data);

// Contact / Enquiry
export const submitContactForm = (data) => api.post('/contact', data).then(r => r.data);
export const submitEnquiryForm = (data) => api.post('/enquiry/product', data).then(r => r.data);

/* ============================
   ADMIN API SERVICES
   ============================ */

// Auth
export const loginAdmin = (credentials) => api.post('/auth/login', credentials).then(r => r.data);
export const changePassword = (data) => api.post('/auth/change-password', data).then(r => r.data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data).then(r => r.data);
export const resetPassword = (data) => api.post('/auth/reset-password', data).then(r => r.data);

// Admin CRUD — Products
export const adminFetchProducts = (params) => api.get('/admin/products', { params }).then(r => r.data);
export const adminCreateProduct = (data) => api.post('/admin/products', data).then(r => r.data);
export const adminUpdateProduct = (id, data) => api.put(`/admin/products/${id}`, data).then(r => r.data);
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`).then(r => r.data);

// Admin CRUD — Categories
export const adminFetchCategories = () => api.get('/admin/categories').then(r => r.data);
export const adminCreateCategory = (data) => api.post('/admin/categories', data).then(r => r.data);
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data).then(r => r.data);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`).then(r => r.data);

// Admin CRUD — Brands
export const adminFetchBrands = () => api.get('/admin/brands').then(r => r.data);
export const adminCreateBrand = (data) => api.post('/admin/brands', data).then(r => r.data);
export const adminUpdateBrand = (id, data) => api.put(`/admin/brands/${id}`, data).then(r => r.data);
export const adminDeleteBrand = (id) => api.delete(`/admin/brands/${id}`).then(r => r.data);

// Admin CRUD — Showcase Stories
export const adminFetchStories = () => api.get('/admin/showcase-stories').then(r => r.data);
export const adminCreateStory = (data) => api.post('/admin/showcase-stories', data).then(r => r.data);
export const adminUpdateStory = (id, data) => api.put(`/admin/showcase-stories/${id}`, data).then(r => r.data);
export const adminDeleteStory = (id) => api.delete(`/admin/showcase-stories/${id}`).then(r => r.data);

// Admin CRUD — Partners
export const adminFetchPartners = () => api.get('/admin/partners').then(r => r.data);
export const adminCreatePartner = (data) => api.post('/admin/partners', data).then(r => r.data);
export const adminUpdatePartner = (id, data) => api.put(`/admin/partners/${id}`, data).then(r => r.data);
export const adminDeletePartner = (id) => api.delete(`/admin/partners/${id}`).then(r => r.data);

// Admin CRUD — Documents
export const adminFetchDocuments = () => api.get('/admin/documents').then(r => r.data);
export const adminCreateDocument = (data) => api.post('/admin/documents', data).then(r => r.data);
export const adminUpdateDocument = (id, data) => api.put(`/admin/documents/${id}`, data).then(r => r.data);
export const adminDeleteDocument = (id) => api.delete(`/admin/documents/${id}`).then(r => r.data);

// Admin — Page SEO
export const adminFetchPageSeo = () => api.get('/admin/page-seo').then(r => r.data);
export const adminUpdatePageSeo = (page, data) => api.put(`/admin/page-seo/${page}`, data).then(r => r.data);

// Admin — Media Library & File Uploads
export const adminFetchMedia = (params) => api.get('/admin/media', { params }).then(r => r.data);
export const adminUploadMedia = async (formData, onProgress) => {
  const filesList = formData.getAll('files');
  const files = [];
  for (const file of filesList) {
    const uploaded = await uploadToCloudinary(file);
    files.push({
      url: uploaded.secure_url,
      filename: file.name,
      publicId: uploaded.public_id,
      size: uploaded.bytes,
      mimeType: file.type || `${uploaded.resource_type}/${uploaded.format}`
    });
  }
  if (onProgress) onProgress({ lengthComputable: true, loaded: 1, total: 1 });
  return api.post('/admin/media/upload', { files }).then(r => r.data);
};

export const uploadSingleFile = async (formData, onProgress) => {
  const file = formData.get('file');
  const uploaded = await uploadToCloudinary(file, onProgress);
  return { url: uploaded.secure_url, data: { url: uploaded.secure_url } };
};

export const uploadMultipleFiles = async (formData, onProgress) => {
  const filesList = formData.getAll('files');
  const urls = [];
  for (const file of filesList) {
    const uploaded = await uploadToCloudinary(file);
    urls.push(uploaded.secure_url);
  }
  if (onProgress) onProgress({ lengthComputable: true, loaded: 1, total: 1 });
  return { urls };
};
export const adminUpdateMedia = (id, data) => api.put(`/admin/media/${id}`, data).then(r => r.data);
export const adminDeleteMedia = (id) => api.delete(`/admin/media/${id}`).then(r => r.data);

// Admin — Dashboard Stats
export const fetchDashboardStats = () => api.get('/admin/dashboard/stats').then(r => r.data);

// Admin — Settings
export const adminFetchSettings = () => api.get('/admin/settings').then(r => r.data);
export const adminUpdateSettings = (data) => api.put('/admin/settings', data).then(r => r.data);
export const exportDatabase = () => api.get('/admin/database/export', { responseType: 'blob' });
