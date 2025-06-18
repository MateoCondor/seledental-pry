import api from './api';

/**
 * Servicios relacionados con la gestión de citas
 */
const citaService = {
  /**
   * Obtiene las categorías disponibles según el tipo de consulta
   * @returns {Promise} - Categorías de consulta
   */
  getCategorias: async () => {
    try {
      const response = await api.get('/citas/categorias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  /**
   * Obtiene los horarios disponibles para una fecha específica
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise} - Horarios disponibles
   */
  getHorariosDisponibles: async (fecha) => {
    try {
      const response = await api.get(`/citas/horarios-disponibles?fecha=${fecha}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva cita
   * @param {Object} citaData - Datos de la cita
   * @returns {Promise<Object>} Respuesta de la API
   */
  crearCita: async (citaData) => {
    try {
      
      console.log('Enviando datos de cita:', citaData);
      const response = await api.post('/citas', citaData);
      console.log('Respuesta del servidor:', response.data);
      return response.data;

    } catch (error) {
      console.error('Error en citaService.crearCita:', error);

      // Mejorar el logging del error
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      }

      throw error;
    }
  },

  /**
   * Obtiene las citas del cliente actual
   * @param {Object} params - Parámetros de consulta (estado, limite, pagina)
   * @returns {Promise} - Citas del cliente
   */
  getMisCitas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/citas/mis-citas${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis citas:', error);
      throw error;
    }
  },

  /**
   * Cancela una cita
   * @param {number} citaId - ID de la cita
   * @param {string} motivoCancelacion - Motivo de cancelación
   * @returns {Promise} - Cita cancelada
   */
  cancelarCita: async (citaId, motivoCancelacion = '') => {
    try {
      const response = await api.put(`/citas/${citaId}/cancelar`, {
        motivoCancelacion
      });
      return response.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  }
};

export default citaService;