import axios from 'axios';

/** Render free : premier appel peut prendre 30–90 s (cold start). */
const DEFAULT_TIMEOUT_MS = 120000;

export function getApiErrorMessage(error) {
  const data = error.response?.data;
  const serverMsg = typeof data?.message === 'string' ? data.message : null;
  if (serverMsg) return serverMsg;

  const code = error.code;
  const msg = String(error.message || '');

  if (code === 'ECONNABORTED' || /timeout/i.test(msg)) {
    return 'Le serveur met du temps à répondre (souvent au premier chargement sur Render). Patientez une minute puis réessayez.';
  }
  if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED' || !error.response) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion et que l’API est déployée.';
  }
  return 'Une erreur est survenue';
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.apiMessage = getApiErrorMessage(error);
    if (error.response?.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
