/**
 * Controlador de Usuarios
 * Este controlador maneja las operaciones CRUD para usuarios por parte de administradores
 */

const Usuario = require('../models/Usuario');
const { successResponse, errorResponse } = require('../utils/responses');

/**
 * Obtiene todos los usuarios del sistema
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const obtenerUsuarios = async (req, res) => {
  try {
    // Obtener todos los usuarios excluyendo el campo password
    const usuarios = await Usuario.findAll({
      where: { 
        activo: true  // Solo obtener usuarios activos
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'ASC']] // Ordenar por fecha de creación
    });
    
    return successResponse(res, 200, 'Usuarios obtenidos correctamente', { 
      usuarios 
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return errorResponse(res, 500, 'Error al obtener la lista de usuarios');
  }
};

/**
 * Obtiene un usuario específico por su ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permisos: solo el propio usuario o un administrador pueden ver los detalles
    if (req.usuario.id !== parseInt(id) && req.usuario.rol !== 'administrador') {
      return errorResponse(res, 403, 'No tiene permisos para ver este usuario');
    }
    
    // Buscar usuario por ID
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado');
    }
    
    return successResponse(res, 200, 'Usuario obtenido correctamente', { 
      usuario 
    });
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return errorResponse(res, 500, 'Error al obtener el usuario');
  }
};

/**
 * Crea un nuevo usuario en el sistema
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, cedula, fechaNacimiento, celular, direccion } = req.body;
    
    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return errorResponse(res, 400, 'El correo electrónico ya está en uso');
    }
    
    // Verificar si la cédula ya está registrada (si se proporciona)
    if (cedula) {
      const usuarioConCedula = await Usuario.findOne({ where: { cedula } });
      if (usuarioConCedula) {
        return errorResponse(res, 400, 'La cédula ya está registrada');
      }
    }
    
    // Validar el rol
    const rolesValidos = ['administrador', 'recepcionista', 'cliente'];
    if (!rolesValidos.includes(rol)) {
      return errorResponse(res, 400, 'Rol no válido', { 
        rolesValidos 
      });
    }
    
    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password, // Se encriptará automáticamente en el modelo
      rol,
      activo: true,
      cedula,
      fechaNacimiento,
      celular,
      direccion,
      perfilCompleto: rol === 'cliente' ? (cedula ? true : false) : true
    });
    
    // Retornar el usuario creado (sin la contraseña)
    const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
      attributes: { exclude: ['password'] }
    });
    
    return successResponse(res, 201, 'Usuario creado correctamente', { 
      usuario: usuarioCreado 
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      return errorResponse(res, 400, 'Error de validación', errores);
    }
    
    return errorResponse(res, 500, 'Error al crear el usuario');
  }
};

/**
 * Actualiza un usuario existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol, activo, cedula, fechaNacimiento, celular, direccion } = req.body;
    
    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado');
    }
    
    // Verificar permisos: solo el propio usuario o un administrador pueden actualizar
    if (req.usuario.id !== parseInt(id) && req.usuario.rol !== 'administrador') {
      return errorResponse(res, 403, 'No tiene permisos para actualizar este usuario');
    }
    
    // Si el usuario no es administrador, no puede cambiar su propio rol ni estado de activación
    if (req.usuario.rol !== 'administrador') {
      if (rol && rol !== usuario.rol) {
        return errorResponse(res, 403, 'No tiene permisos para cambiar el rol');
      }
      if (activo !== undefined && activo !== usuario.activo) {
        return errorResponse(res, 403, 'No tiene permisos para cambiar el estado de activación');
      }
    }
    
    // NUEVA VALIDACIÓN: Prevenir que un administrador cambie su propio rol
    if (req.usuario.id === parseInt(id) && req.usuario.rol === 'administrador' && rol && rol !== 'administrador') {
      return errorResponse(res, 403, 'No puede cambiar su propio rol de administrador');
    }
    
    // Si se está actualizando el email, verificar que no esté en uso
    if (email && email !== usuario.email) {
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return errorResponse(res, 400, 'El correo electrónico ya está en uso');
      }
    }
    
    // Si se está actualizando la cédula, verificar que no esté en uso
    if (cedula && cedula !== usuario.cedula) {
      const usuarioConCedula = await Usuario.findOne({ 
        where: { 
          cedula,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (usuarioConCedula) {
        return errorResponse(res, 400, 'La cédula ya está registrada por otro usuario');
      }
    }
    
    // Validar el rol (si se proporciona)
    if (rol) {
      const rolesValidos = ['administrador', 'recepcionista', 'cliente'];
      if (!rolesValidos.includes(rol)) {
        return errorResponse(res, 400, 'Rol no válido', { 
          rolesValidos 
        });
      }
    }
    
    // Determinar si el perfil está completo
    let perfilCompleto = usuario.perfilCompleto;
    if (usuario.rol === 'cliente' || rol === 'cliente') {
      const cedulaFinal = cedula !== undefined ? cedula : usuario.cedula;
      const fechaNacimientoFinal = fechaNacimiento !== undefined ? fechaNacimiento : usuario.fechaNacimiento;
      const celularFinal = celular !== undefined ? celular : usuario.celular;
      const direccionFinal = direccion !== undefined ? direccion : usuario.direccion;
      
      perfilCompleto = !!(cedulaFinal && fechaNacimientoFinal && celularFinal && direccionFinal);
    } else {
      perfilCompleto = true; // Administradores y recepcionistas no necesitan completar perfil adicional
    }
    
    // Actualizar el usuario
    await usuario.update({
      nombre: nombre !== undefined ? nombre : usuario.nombre,
      apellido: apellido !== undefined ? apellido : usuario.apellido,
      email: email !== undefined ? email : usuario.email,
      password: password || undefined, // Solo actualizar si se proporciona
      rol: rol !== undefined ? rol : usuario.rol,
      activo: activo !== undefined ? activo : usuario.activo,
      cedula: cedula !== undefined ? cedula : usuario.cedula,
      fechaNacimiento: fechaNacimiento !== undefined ? fechaNacimiento : usuario.fechaNacimiento,
      celular: celular !== undefined ? celular : usuario.celular,
      direccion: direccion !== undefined ? direccion : usuario.direccion,
      perfilCompleto
    });
    
    // Obtener el usuario actualizado (sin la contraseña)
    const usuarioActualizado = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    return successResponse(res, 200, 'Usuario actualizado correctamente', { 
      usuario: usuarioActualizado 
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      return errorResponse(res, 400, 'Error de validación', errores);
    }
    
    return errorResponse(res, 500, 'Error al actualizar el usuario');
  }
};

/**
 * Elimina un usuario (desactivación lógica)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado');
    }
    
    // Verifica que no se esté intentando desactivar al usuario actual
    if (parseInt(id) === req.usuario.id) {
      return errorResponse(res, 400, 'No puede desactivar su propia cuenta');
    }
    
    // Desactivar el usuario (eliminación lógica)
    await usuario.update({ activo: false });
    
    return successResponse(res, 200, 'Usuario desactivado correctamente');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return errorResponse(res, 500, 'Error al desactivar el usuario');
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};