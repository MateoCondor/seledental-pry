/**
 * Configuración de WebSocket para actualizaciones en tiempo real
 * Maneja las conexiones WebSocket para el calendario de citas
 */

const { Server } = require('socket.io');

let io = null;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Unirse a una sala específica para una fecha
    socket.on('join_date_room', (fecha) => {
      socket.join(`fecha_${fecha}`);
      console.log(`Cliente ${socket.id} se unió a la sala fecha_${fecha}`);
    });

    // Salir de una sala de fecha
    socket.on('leave_date_room', (fecha) => {
      socket.leave(`fecha_${fecha}`);
      console.log(`Cliente ${socket.id} salió de la sala fecha_${fecha}`);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('WebSocket no está inicializado');
  }
  return io;
};

// Función para notificar cambios en horarios
const notificarCambioHorarios = (fecha) => {
  if (io) {
    io.to(`fecha_${fecha}`).emit('horarios_updated', { fecha });
  }
};

module.exports = {
  initializeWebSocket,
  getIO,
  notificarCambioHorarios
};