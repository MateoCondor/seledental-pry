/**
 * Controlador de Citas
 * Este controlador maneja las operaciones CRUD para citas
 */

const { Usuario, Cita } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { Op } = require('sequelize');
const { notificarCambioHorarios } = require('../config/websocket');

/**
 * Obtiene las categorías disponibles según el tipo de consulta
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = {
      general: [
        { value: 'odontologia_general', label: 'Odontología general' },
        { value: 'diagnostico_especialidad', label: 'Diagnóstico por especialidad' }
      ],
      control: [
        { value: 'ortodoncia', label: 'Ortodoncia' },
        { value: 'endodoncia', label: 'Endodoncia' },
        { value: 'cirugia_oral', label: 'Cirugía oral' },
        { value: 'protesis', label: 'Prótesis' },
        { value: 'periodoncia', label: 'Periodoncia' }
      ],
      urgencia: [
        { value: 'cirugia_oral_urgencia', label: 'Cirugía oral' },
        { value: 'endodoncia_urgencia', label: 'Endodoncia' },
        { value: 'rehabilitacion', label: 'Rehabilitación' },
        { value: 'trauma_dental', label: 'Trauma dental' }
      ]
    };

    return successResponse(res, 200, 'Categorías obtenidas correctamente', { categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return errorResponse(res, 500, 'Error al obtener las categorías');
  }
};

/**
 * Obtiene los horarios disponibles para una fecha específica
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return errorResponse(res, 400, 'La fecha es requerida');
    }

    // SOLUCIÓN: Usar el mismo método de construcción de fecha
    const [año, mes, dia] = fecha.split('-').map(Number);
    const fechaSeleccionada = new Date(año, mes - 1, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      return errorResponse(res, 400, 'No se pueden agendar citas en fechas pasadas');
    }

    // Horarios de trabajo (8:00 AM a 6:00 PM)
    const horariosBase = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];

    // Obtener citas ya agendadas para esa fecha - usar construcción consistente
    const fechaInicio = new Date(año, mes - 1, dia, 0, 0, 0, 0);
    const fechaFin = new Date(año, mes - 1, dia, 23, 59, 59, 999);

    console.log('Buscando citas entre:', fechaInicio, 'y', fechaFin);

    const citasOcupadas = await Cita.findAll({
      where: {
        fechaHora: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        estado: {
          [Op.notIn]: ['cancelada', 'no_asistio']
        }
      },
      attributes: ['fechaHora', 'duracion']
    });

    console.log('Citas ocupadas encontradas:', citasOcupadas.length);

    // Filtrar horarios disponibles considerando la duración de 1 hora
    const horariosDisponibles = horariosBase.filter(horario => {
      const [hora, minuto] = horario.split(':');
      const horaInicial = parseInt(hora);
      const minutoInicial = parseInt(minuto);

      // Verificar si hay conflicto con citas existentes
      const tieneConflicto = citasOcupadas.some(cita => {
        const horaCita = cita.fechaHora.getHours();
        const minutoCita = cita.fechaHora.getMinutes();

        // Calcular el final de la cita existente (1 hora después)
        const finCitaHora = minutoCita === 30 ? horaCita + 1 : horaCita;
        const finCitaMinuto = minutoCita === 30 ? 0 : 30;

        // Verificar si el horario propuesto se solapa con la cita existente
        // Una cita ocupa desde su hora inicial hasta 1 hora después

        // Caso 1: El horario propuesto es exactamente cuando inicia una cita existente
        if (horaInicial === horaCita && minutoInicial === minutoCita) {
          return true;
        }

        // Caso 2: El horario propuesto está dentro del rango de una cita existente
        // Si la cita existente es a las 8:00, ocupa de 8:00 a 9:00 (bloquea 8:00 y 8:30)
        if (horaInicial === horaCita && minutoInicial > minutoCita) {
          return true;
        }

        // Caso 3: El horario propuesto es 30 minutos después de una cita que inicia en :00
        if (horaInicial === horaCita && minutoCita === 0 && minutoInicial === 30) {
          return true;
        }

        // Caso 4: Si la cita existente inicia en :30, también bloquea la siguiente hora
        if (minutoCita === 30) {
          if (horaInicial === horaCita + 1 && minutoInicial === 0) {
            return true;
          }
        }

        return false;
      });

      return !tieneConflicto;
    });

    return successResponse(res, 200, 'Horarios disponibles obtenidos correctamente', {
      fecha,
      horariosDisponibles
    });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    return errorResponse(res, 500, 'Error al obtener los horarios disponibles');
  }
};

/**
 * Crea una nueva cita
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const crearCita = async (req, res) => {
  try {
    const { tipoConsulta, categoria, fechaHora, detalles } = req.body;
    const clienteId = req.usuario.id;

    // Validaciones básicas
    if (!tipoConsulta || !categoria || !fechaHora) {
      return errorResponse(res, 400, 'Tipo de consulta, categoría y fecha/hora son requeridos');
    }

    // Validar que el usuario sea cliente
    if (req.usuario.rol !== 'cliente') {
      return errorResponse(res, 403, 'Solo los clientes pueden agendar citas');
    }

    // Validar que el perfil del cliente esté completo
    if (!req.usuario.perfilCompleto) {
      return errorResponse(res, 400, 'Debe completar su perfil antes de agendar una cita');
    }

    // SOLUCIÓN: Crear la fecha correctamente con timezone local
    // Parsear la fecha del formato "YYYY-MM-DDTHH:mm:ss"
    const [fechaParte, horaParte] = fechaHora.split('T');
    const [año, mes, dia] = fechaParte.split('-').map(Number);
    const [hora, minuto] = horaParte.split(':').map(Number);

    // Crear fecha en timezone local (no UTC)
    const fechaCita = new Date(año, mes - 1, dia, hora, minuto, 0, 0);

    console.log('Fecha recibida:', fechaHora);
    console.log('Fecha procesada:', fechaCita);
    console.log('Fecha ISO:', fechaCita.toISOString());

    const ahora = new Date();

    if (fechaCita <= ahora) {
      return errorResponse(res, 400, 'La fecha y hora de la cita debe ser futura');
    }

    // Verificar disponibilidad del horario considerando duración de 1 hora
    const fechaInicio = new Date(año, mes - 1, dia, 0, 0, 0, 0);
    const fechaFin = new Date(año, mes - 1, dia, 23, 59, 59, 999);

    const citasExistentes = await Cita.findAll({
      where: {
        fechaHora: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        estado: {
          [Op.notIn]: ['cancelada', 'no_asistio']
        }
      }
    });

    // Verificar conflicto de horario considerando que cada cita dura 1 hora
    const tieneConflicto = citasExistentes.some(citaExistente => {
      const horaExistente = citaExistente.fechaHora.getHours();
      const minutoExistente = citaExistente.fechaHora.getMinutes();

      // La nueva cita ocupará desde su hora inicial hasta 1 hora después
      const finNuevaCitaHora = minuto === 30 ? hora + 1 : hora;
      const finNuevaCitaMinuto = minuto === 30 ? 0 : 30;

      // La cita existente ocupa desde su hora inicial hasta 1 hora después
      const finCitaExistenteHora = minutoExistente === 30 ? horaExistente + 1 : horaExistente;
      const finCitaExistenteMinuto = minutoExistente === 30 ? 0 : 30;

      // Verificar solapamiento entre los rangos de tiempo
      // Rango nueva cita: [hora:minuto - finNuevaCitaHora:finNuevaCitaMinuto]
      // Rango cita existente: [horaExistente:minutoExistente - finCitaExistenteHora:finCitaExistenteMinuto]

      const inicioNueva = hora * 60 + minuto; // en minutos desde medianoche
      const finNueva = finNuevaCitaHora * 60 + finNuevaCitaMinuto;

      const inicioExistente = horaExistente * 60 + minutoExistente;
      const finExistente = finCitaExistenteHora * 60 + finCitaExistenteMinuto;

      // Hay conflicto si los rangos se solapan
      return (inicioNueva < finExistente && finNueva > inicioExistente);
    });

    if (tieneConflicto) {
      return errorResponse(res, 400, 'El horario seleccionado no está disponible');
    }

    // Crear la cita con duración por defecto de 60 minutos
    const nuevaCita = await Cita.create({
      clienteId,
      tipoConsulta,
      categoria,
      fechaHora: fechaCita,
      duracion: 60, // 60 minutos por defecto
      detalles: detalles || null,
      estado: 'pendiente'
    });

    // Obtener la cita creada con datos del cliente
    const citaCreada = await Cita.findByPk(nuevaCita.id, {
      include: [
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'email', 'celular']
        }
      ]
    });

    // Notificar cambios en horarios vía WebSocket - usar la fecha original
    notificarCambioHorarios(fechaParte);

    return successResponse(res, 201, 'Cita agendada correctamente', {
      cita: citaCreada
    });
  } catch (error) {
    console.error('Error al crear cita:', error);

    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      return errorResponse(res, 400, 'Error de validación', errores);
    }

    return errorResponse(res, 500, 'Error al agendar la cita');
  }
};

/**
 * Obtiene las citas del cliente autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const obtenerCitasCliente = async (req, res) => {
  try {
    const clienteId = req.usuario.id;
    const { estado, limite = 50, pagina = 1 } = req.query;

    let whereCondition = { clienteId };

    if (estado) {
      whereCondition.estado = estado;
    }

    const offset = (pagina - 1) * limite;

    const { count, rows: citas } = await Cita.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Usuario,
          as: 'odontologo',
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        }
      ],
      order: [['fechaHora', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset)
    });

    return successResponse(res, 200, 'Citas obtenidas correctamente', {
      citas,
      totalCitas: count,
      paginaActual: parseInt(pagina),
      totalPaginas: Math.ceil(count / limite)
    });
  } catch (error) {
    console.error('Error al obtener citas del cliente:', error);
    return errorResponse(res, 500, 'Error al obtener las citas');
  }
};

/**
 * Cancela una cita
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoCancelacion } = req.body;
    const usuarioId = req.usuario.id;

    const cita = await Cita.findByPk(id);
    
    if (!cita) {
      return errorResponse(res, 404, 'Cita no encontrada');
    }

    // Verificar permisos
    if (req.usuario.rol === 'cliente' && cita.clienteId !== usuarioId) {
      return errorResponse(res, 403, 'No tiene permisos para cancelar esta cita');
    }

    // Verificar que la cita se pueda cancelar
    if (['completada', 'cancelada', 'no_asistio'].includes(cita.estado)) {
      return errorResponse(res, 400, 'No se puede cancelar una cita en este estado');
    }

    // Verificar tiempo mínimo para cancelación (24 horas antes)
    const ahora = new Date();
    const fechaCita = new Date(cita.fechaHora);
    const horasRestantes = (fechaCita - ahora) / (1000 * 60 * 60);
    
    if (horasRestantes < 24 && req.usuario.rol === 'cliente') {
      return errorResponse(res, 400, 'Las citas deben cancelarse con al menos 24 horas de anticipación');
    }

    console.log('Cancelando cita:', {
      id: cita.id,
      fechaHora: cita.fechaHora,
      estadoAnterior: cita.estado
    });

    // Actualizar la cita - ESTO LIBERA AUTOMÁTICAMENTE LOS HORARIOS
    await cita.update({
      estado: 'cancelada',
      motivoCancelacion: motivoCancelacion || 'Sin motivo especificado',
      fechaCancelacion: new Date()
    });

    console.log('Cita cancelada exitosamente, horarios liberados');

    // Obtener solo la fecha para notificación WebSocket
    const fechaSolo = new Date(cita.fechaHora);
    const fechaString = `${fechaSolo.getFullYear()}-${String(fechaSolo.getMonth() + 1).padStart(2, '0')}-${String(fechaSolo.getDate()).padStart(2, '0')}`;
    
    // Notificar cambios en horarios vía WebSocket - ESTO ACTUALIZA LOS HORARIOS DISPONIBLES EN TIEMPO REAL
    console.log('Notificando cambio de horarios para fecha:', fechaString);
    notificarCambioHorarios(fechaString);

    // Obtener la cita actualizada con todos los datos
    const citaCancelada = await Cita.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'email', 'celular']
        }
      ]
    });

    return successResponse(res, 200, 'Cita cancelada correctamente. Los horarios han sido liberados y están disponibles nuevamente.', { 
      cita: citaCancelada 
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    return errorResponse(res, 500, 'Error al cancelar la cita');
  }
};

module.exports = {
  obtenerCategorias,
  obtenerHorariosDisponibles,
  crearCita,
  obtenerCitasCliente,
  cancelarCita
};