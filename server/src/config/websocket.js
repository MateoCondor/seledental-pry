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

    // Unirse a la sala de recepcionistas para recibir nuevas citas
    socket.on('join_recepcionista_room', () => {
      socket.join('recepcionistas');
      console.log(`Cliente ${socket.id} se unió a la sala de recepcionistas`);
    });

    // Salir de la sala de recepcionistas
    socket.on('leave_recepcionista_room', () => {
      socket.leave('recepcionistas');
      console.log(`Cliente ${socket.id} salió de la sala de recepcionistas`);
    });

    // Unirse a una sala específica de cliente para recibir actualizaciones de sus citas
    socket.on('join_cliente_room', (clienteId) => {
      socket.join(`cliente_${clienteId}`);
      console.log(`Cliente ${socket.id} se unió a la sala cliente_${clienteId}`);
    });

    // Salir de la sala de cliente
    socket.on('leave_cliente_room', (clienteId) => {
      socket.leave(`cliente_${clienteId}`);
      console.log(`Cliente ${socket.id} salió de la sala cliente_${clienteId}`);
    });

    // Unirse a una sala específica de odontólogo para recibir citas asignadas
    socket.on('join_odontologo_room', (odontologoId) => {
      socket.join(`odontologo_${odontologoId}`);
      console.log(`Cliente ${socket.id} se unió a la sala odontologo_${odontologoId}`);
    });

    // Salir de la sala de odontólogo
    socket.on('leave_odontologo_room', (odontologoId) => {
      socket.leave(`odontologo_${odontologoId}`);
      console.log(`Cliente ${socket.id} salió de la sala odontologo_${odontologoId}`);
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

// Función para notificar nueva cita a recepcionistas
const notificarNuevaCita = (cita) => {
  if (io) {
    io.to('recepcionistas').emit('nueva_cita', { cita });
  }
};

// Función para notificar asignación de odontólogo a cliente
const notificarAsignacionOdontologo = (clienteId, cita) => {
  if (io) {
    io.to(`cliente_${clienteId}`).emit('cita_asignada', { cita });
  }
};

// Función para notificar cambios en el estado de una cita
const notificarCambioEstadoCita = (clienteId, cita) => {
  if (io) {
    io.to(`cliente_${clienteId}`).emit('cita_actualizada', { cita });
  }
};

// Función para notificar nueva cita asignada a odontólogo
const notificarCitaAsignadaOdontologo = (odontologoId, cita) => {
  if (io) {
    io.to(`odontologo_${odontologoId}`).emit('nueva_cita_asignada', { cita });
  }
};

// Función para notificar cambios en citas del odontólogo
const notificarCambioCitaOdontologo = (odontologoId, cita) => {
  if (io) {
    io.to(`odontologo_${odontologoId}`).emit('cita_actualizada_odontologo', { cita });
  }
};

module.exports = {
  initializeWebSocket,
  getIO,
  notificarCambioHorarios,
  notificarNuevaCita,
  notificarAsignacionOdontologo,
  notificarCambioEstadoCita,
  notificarCitaAsignadaOdontologo,
  notificarCambioCitaOdontologo
};