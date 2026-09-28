import axios from 'axios';

// In production, VITE_API_BASE_URL must be set in the Vercel dashboard
// to the full backend URL (e.g. https://sentron-asia-api.vercel.app/api).
// In development, the Vite proxy handles /api → localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    '[Sentron] VITE_API_BASE_URL is not set. API calls will go to /api on the same domain, ' +
    'which will 404 if the backend is on a separate Vercel project.'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // NOTE: withCredentials is intentionally NOT set here.
  // This app uses JWT Bearer tokens via the Authorization header, not cookies.
  // Setting withCredentials:true on cross-origin requests forces the browser
  // to require Access-Control-Allow-Credentials:true AND an exact origin match
  // in the CORS response—which breaks if there's any mismatch.
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sentron-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let Axios auto-set Content-Type for FormData (multipart boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sentron-token');
      localStorage.removeItem('sentron-user');
      // Only redirect if we're on an admin page and not already on the login page
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
