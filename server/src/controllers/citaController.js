/**
 * Controlador de Citas
 * Este controlador maneja las operaciones CRUD para citas
 */

const { Usuario, Cita } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { Op } = require('sequelize');

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

    // Validar que la fecha no sea en el pasado
    const fechaSeleccionada = new Date(fecha);
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

    // Obtener citas ya agendadas para esa fecha
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

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

    // Filtrar horarios disponibles
    const horariosDisponibles = horariosBase.filter(horario => {
      const [hora, minuto] = horario.split(':');
      const fechaHorario = new Date(fecha);
      fechaHorario.setHours(parseInt(hora), parseInt(minuto), 0, 0);

      // Verificar si hay conflicto con citas existentes
      const tieneConflicto = citasOcupadas.some(cita => {
        const inicioExistente = new Date(cita.fechaHora);
        const finExistente = new Date(inicioExistente.getTime() + (cita.duracion * 60000));
        const finNuevo = new Date(fechaHorario.getTime() + (60 * 60000)); // Asumiendo 60 min por defecto

        return (fechaHorario < finExistente && finNuevo > inicioExistente);
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

    // Validar fecha y hora
    const fechaCita = new Date(fechaHora);
    const ahora = new Date();
    
    if (fechaCita <= ahora) {
      return errorResponse(res, 400, 'La fecha y hora de la cita debe ser futura');
    }

    // Verificar disponibilidad del horario
    const citaExistente = await Cita.findOne({
      where: {
        fechaHora: fechaCita,
        estado: {
          [Op.notIn]: ['cancelada', 'no_asistio']
        }
      }
    });

    if (citaExistente) {
      return errorResponse(res, 400, 'El horario seleccionado no está disponible');
    }

    // Crear la cita
    const nuevaCita = await Cita.create({
      clienteId,
      tipoConsulta,
      categoria,
      fechaHora: fechaCita,
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

    // Actualizar la cita
    await cita.update({
      estado: 'cancelada',
      motivoCancelacion: motivoCancelacion || 'Sin motivo especificado'
    });

    return successResponse(res, 200, 'Cita cancelada correctamente', { cita });
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