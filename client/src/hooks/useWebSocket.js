import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook personalizado para manejar conexiones WebSocket
 * @param {string} serverUrl - URL del servidor WebSocket
 * @returns {Object} - Socket y funciones de utilidad
 */
const useWebSocket = (serverUrl = 'http://localhost:5000') => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Inicializar conexión WebSocket
    socketRef.current = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
    });

    // Cleanup al desmontar el componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  /**
   * Une el cliente a una sala específica para una fecha
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   */
  const joinDateRoom = (fecha) => {
    if (socketRef.current) {
      socketRef.current.emit('join_date_room', fecha);
    }
  };

  /**
   * Sale de una sala específica para una fecha
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   */
  const leaveDateRoom = (fecha) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_date_room', fecha);
    }
  };

  /**
   * Une a la sala de recepcionistas para recibir nuevas citas
   */
  const joinRecepcionistaRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('join_recepcionista_room');
    }
  };

  /**
   * Sale de la sala de recepcionistas
   */
  const leaveRecepcionistaRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_recepcionista_room');
    }
  };

  /**
   * Une a la sala de un cliente específico
   * @param {number} clienteId - ID del cliente
   */
  const joinClienteRoom = (clienteId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_cliente_room', clienteId);
    }
  };

  /**
   * Sale de la sala de un cliente específico
   * @param {number} clienteId - ID del cliente
   */
  const leaveClienteRoom = (clienteId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_cliente_room', clienteId);
    }
  };

  /**
   * Une a la sala de un odontólogo específico
   * @param {number} odontologoId - ID del odontólogo
   */
  const joinOdontologoRoom = (odontologoId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_odontologo_room', odontologoId);
    }
  };

  /**
   * Sale de la sala de un odontólogo específico
   * @param {number} odontologoId - ID del odontólogo
   */
  const leaveOdontologoRoom = (odontologoId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_odontologo_room', odontologoId);
    }
  };

  /**
   * Escucha actualizaciones de horarios
   * @param {Function} callback - Función a ejecutar cuando se actualicen los horarios
   */
  const onHorariosUpdated = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('horarios_updated', callback);
    }
  };

  /**
   * Deja de escuchar actualizaciones de horarios
   */
  const offHorariosUpdated = () => {
    if (socketRef.current) {
      socketRef.current.off('horarios_updated');
    }
  };

  /**
   * Escucha nuevas citas (para recepcionistas)
   * @param {Function} callback - Función a ejecutar cuando llegue una nueva cita
   */
  const onNuevaCita = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('nueva_cita', callback);
    }
  };

  /**
   * Deja de escuchar nuevas citas
   */
  const offNuevaCita = () => {
    if (socketRef.current) {
      socketRef.current.off('nueva_cita');
    }
  };

  /**
   * Escucha asignaciones de odontólogo (para clientes)
   * @param {Function} callback - Función a ejecutar cuando se asigne un odontólogo
   */
  const onCitaAsignada = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_asignada', callback);
    }
  };

  /**
   * Deja de escuchar asignaciones de odontólogo
   */
  const offCitaAsignada = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_asignada');
    }
  };

  /**
   * Escucha actualizaciones de citas (para clientes)
   * @param {Function} callback - Función a ejecutar cuando se actualice una cita
   */
  const onCitaActualizada = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_actualizada', callback);
    }
  };

  /**
   * Deja de escuchar actualizaciones de citas
   */
  const offCitaActualizada = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_actualizada');
    }
  };

  /**
   * Escucha citas canceladas (para recepcionistas)
   * @param {Function} callback - Función a ejecutar cuando se cancele una cita
   */
  const onCitaCancelada = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_cancelada', callback);
    }
  };

  /**
   * Deja de escuchar citas canceladas
   */
  const offCitaCancelada = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_cancelada');
    }
  };

  /**
   * Escucha citas reagendadas (para recepcionistas)
   * @param {Function} callback - Función a ejecutar cuando se reagende una cita
   */
  const onCitaReagendada = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_reagendada', callback);
    }
  };

  /**
   * Deja de escuchar citas reagendadas
   */
  const offCitaReagendada = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_reagendada');
    }
  };

  /**
   * Escucha asignaciones de odontólogo (para recepcionistas)
   * @param {Function} callback - Función a ejecutar cuando se asigne un odontólogo
   */
  const onCitaAsignadaOdontologo = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_asignada_odontologo', callback);
    }
  };

  /**
   * Deja de escuchar asignaciones de odontólogo
   */
  const offCitaAsignadaOdontologo = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_asignada_odontologo');
    }
  };

  // Funciones para odontólogos
  /**
   * Escucha nuevas citas asignadas (para odontólogos)
   * @param {Function} callback - Función a ejecutar cuando se asigne una nueva cita
   */
  const onNuevaCitaAsignada = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('nueva_cita_asignada', callback);
    }
  };

  /**
   * Deja de escuchar nuevas citas asignadas
   */
  const offNuevaCitaAsignada = () => {
    if (socketRef.current) {
      socketRef.current.off('nueva_cita_asignada');
    }
  };

  /**
   * Escucha actualizaciones de citas del odontólogo
   * @param {Function} callback - Función a ejecutar cuando se actualice una cita del odontólogo
   */
  const onCitaActualizadaOdontologo = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_actualizada_odontologo', callback);
    }
  };

  /**
   * Deja de escuchar actualizaciones de citas del odontólogo
   */
  const offCitaActualizadaOdontologo = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_actualizada_odontologo');
    }
  };

  /**
   * Escucha citas completadas (para recepcionistas)
   * @param {Function} callback - Función a ejecutar cuando se complete una cita
   */
  const onCitaCompletada = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_completada', callback);
    }
  };

  /**
   * Deja de escuchar citas completadas
   */
  const offCitaCompletada = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_completada');
    }
  };

  /**
   * Escucha citas iniciadas (para recepcionistas)
   * @param {Function} callback - Función a ejecutar cuando se inicie una cita
   */
  const onCitaIniciada = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('cita_iniciada', callback);
    }
  };

  /**
   * Deja de escuchar citas iniciadas
   */
  const offCitaIniciada = () => {
    if (socketRef.current) {
      socketRef.current.off('cita_iniciada');
    }
  };

  return {
    socket: socketRef.current,
    joinDateRoom,
    leaveDateRoom,
    joinRecepcionistaRoom,
    leaveRecepcionistaRoom,
    joinClienteRoom,
    leaveClienteRoom,
    joinOdontologoRoom,
    leaveOdontologoRoom,
    onHorariosUpdated,
    offHorariosUpdated,
    onNuevaCita,
    offNuevaCita,
    onCitaAsignada,
    offCitaAsignada,
    onCitaActualizada,
    offCitaActualizada,
    onCitaCancelada,
    offCitaCancelada,
    onCitaReagendada,
    offCitaReagendada,
    onCitaAsignadaOdontologo,
    offCitaAsignadaOdontologo,
    onNuevaCitaAsignada,
    offNuevaCitaAsignada,
    onCitaActualizadaOdontologo,
    offCitaActualizadaOdontologo,
    onCitaCompletada,
    offCitaCompletada,
    onCitaIniciada,
    offCitaIniciada,
  };
};

export default useWebSocket;