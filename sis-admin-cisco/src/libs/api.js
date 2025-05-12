import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true, // Fundamental para cookies HTTP-only
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Eliminar el interceptor de request que añade el token de localStorage
// Ya que estamos usando cookies HTTP-only

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si no está autenticado
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/auth') &&
          !window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;