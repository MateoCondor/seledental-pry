import axios from 'axios';

// Creamos una instancia de axios con la URL base del API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Ajusta esta URL según donde esté corriendo tu servidor
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Asegúrate de rechazar con una instancia de Error
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error(error?.message || 'Unknown error'));
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (Unauthorized), el token ha expirado
    if (error.response && error.response.status === 401 && 
        !error.config.url.includes('/auth/login')) {
      // Solo redirigir si no es una solicitud de login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error instanceof Error) {
      return Promise.reject(error);
    }
  
    return Promise.reject(new Error(error?.message || 'Unknown error'));
  }
);

export default api;
