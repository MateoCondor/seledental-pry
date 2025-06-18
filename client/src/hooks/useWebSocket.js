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

  return {
    socket: socketRef.current,
    joinDateRoom,
    leaveDateRoom,
    onHorariosUpdated,
    offHorariosUpdated,
  };
};

export default useWebSocket;