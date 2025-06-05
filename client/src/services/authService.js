import api from './api';

/**
 * Servicios relacionados con la autenticación
 */
const authService = {  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} - Respuesta con los datos del usuario y el token
   */  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Verificar que la respuesta tiene la estructura esperada
      const responseData = response.data;
      
      if (!responseData.success) {
        return {
          success: false,
          message: responseData.mensaje || 'Error en el servidor'
        };
      }
      
      // Verificar si los datos están en la propiedad 'datos'
      if (responseData.datos && responseData.datos.usuario && responseData.datos.token) {
        return {
          success: true,
          usuario: responseData.datos.usuario,
          token: responseData.datos.token
        };
      } else {
        console.error('Estructura de respuesta inesperada:', responseData);
        return {
          success: false,
          message: 'La respuesta del servidor no tiene el formato esperado'
        };
      }
    } catch (error) {
      console.error('Error en la solicitud de login:', error);
        // Manejar específicamente los errores de autenticación
      if (error.response && error.response.status === 401) {
        // Verificar el mensaje específico del servidor
        const errorMsg = error.response.data && error.response.data.mensaje;
        
        if (errorMsg === 'Correo electrónico no registrado') {
          return {
            success: false,
            message: 'El correo electrónico no está registrado',
            errorType: 'email'
          };
        } else if (errorMsg === 'Contraseña incorrecta') {
          return {
            success: false,
            message: 'La contraseña es incorrecta',
            errorType: 'password'
          };
        } else {
          return {
            success: false,
            message: 'Credenciales incorrectas',
            errorType: 'both'
          };
        }
      } else if (error.response && error.response.data && error.response.data.mensaje) {
        // Si el servidor envía un mensaje de error, lo usamos
        return {
          success: false,
          message: error.response.data.mensaje
        };
      } else {
        // Errores generales o de conexión
        return {
          success: false,
          message: 'Error de conexión con el servidor'
        };
      }
    }
  },

  /**
   * Registra un nuevo cliente (registro público)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} - Respuesta con los datos del usuario creado
   */
  registroCliente: async (userData) => {
    try {
      const response = await api.post('/auth/registro-cliente', userData);
      return {
        success: true,
        usuario: response.data.datos.usuario,
        token: response.data.datos.token,
        message: response.data.mensaje
      };
    } catch (error) {
      console.error('Error en registro de cliente:', error);
      return {
        success: false,
        message: error.response?.data?.mensaje || 'Error al registrar cliente'
      };
    }
  },

  /**
   * Completa el perfil de un cliente
   * @param {Object} perfilData - Datos adicionales del perfil
   * @returns {Promise} - Respuesta con confirmación
   */
  completarPerfil: async (perfilData) => {
    try {
      const response = await api.put('/auth/completar-perfil', perfilData);
      return {
        success: true,
        usuario: response.data.datos.usuario,
        message: response.data.mensaje
      };
    } catch (error) {
      console.error('Error al completar perfil:', error);
      throw error;
    }
  },

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise} - Respuesta con los datos del perfil
   */
  obtenerPerfil: async () => {
    try {
      const response = await api.get('/auth/perfil');
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  /**
   * Registra un nuevo usuario (solo para pruebas, normalmente los usuarios se crean por administrador)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} - Respuesta con los datos del usuario creado
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Guarda la información del usuario y token en el localStorage
   * @param {Object} userData - Datos del usuario
   * @param {string} token - Token JWT
   */
  setUserData: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  },

  /**
   * Obtiene la información del usuario desde el localStorage
   * @returns {Object|null} - Datos del usuario o null si no está autenticado
   */
  getUserData: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Obtiene el token JWT desde el localStorage
   * @returns {string|null} - Token JWT o null si no está autenticado
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Cierra la sesión eliminando datos del localStorage
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
};

export default authService;
