import api from './api';

/**
 * Servicios relacionados con la gestión de usuarios
 */
const usuarioService = {
  /**
   * Obtiene todos los usuarios (solo para administradores)
   * @returns {Promise} - Lista de usuarios
   */
  getUsuarios: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  /**
   * Obtiene un usuario por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise} - Datos del usuario
   */
  getUsuario: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      // La estructura de la respuesta es {success, mensaje, datos: {usuario}}
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo usuario (solo para administradores)
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise} - Datos del usuario creado
   */
  createUsuario: async (userData) => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },
  /**
   * Actualiza un usuario existente
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise} - Datos del usuario actualizado
   */
  updateUsuario: async (id, userData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  /**
   * Elimina un usuario (solo para administradores)
   * @param {string} id - ID del usuario
   * @returns {Promise} - Confirmación de eliminación
   */
  deleteUsuario: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Actualiza la contraseña del usuario
   * @param {string} id - ID del usuario
   * @param {Object} passwordData - Objeto con contraseña actual y nueva
   * @returns {Promise} - Confirmación de cambio
   */
  updatePassword: async (id, passwordData) => {
    const response = await api.put(`/usuarios/${id}/password`, passwordData);
    return response.data;
  },
};

export default usuarioService;
