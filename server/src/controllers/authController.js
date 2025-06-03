/**
 * Controlador de Autenticación
 * Este controlador maneja las operaciones de registro y login de usuarios
 */

const Usuario = require('../models/Usuario');
const { generarJWT } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/responses');

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;
    
    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return errorResponse(res, 400, 'El correo electrónico ya está registrado');
    }
    
    // Validar el rol (opcional, depende de los requisitos)
    const rolesValidos = ['administrador', 'recepcionista', 'cliente'];
    if (rol && !rolesValidos.includes(rol)) {
      return errorResponse(res, 400, 'Rol no válido', { 
        rolesValidos 
      });
    }
    
    // Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password, // La contraseña se hasheará automáticamente gracias al hook
      rol: rol || 'cliente' // Si no se especifica, asignar rol 'cliente'
    });
    
    // Generar JWT para el nuevo usuario
    const token = generarJWT(nuevoUsuario);
    
    // Responder con los datos del usuario (sin incluir la contraseña)
    return successResponse(res, 201, 'Usuario registrado exitosamente', {
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      return errorResponse(res, 400, 'Error de validación', errores);
    }
    
    return errorResponse(res, 500, 'Error al registrar usuario');
  }
};

/**
 * Inicia sesión para un usuario existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar que se proporcionaron email y password
    if (!email || !password) {
      return errorResponse(res, 400, 'Por favor, proporcione email y contraseña');
    }
      // Buscar el usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return errorResponse(res, 401, 'Correo electrónico no registrado');
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return errorResponse(res, 403, 'Usuario desactivado. Contacte al administrador');
    }
    
    // Verificar la contraseña
    const passwordCorrecta = await usuario.verificarPassword(password);
    if (!passwordCorrecta) {
      return errorResponse(res, 401, 'Contraseña incorrecta');
    }
    
    // Generar JWT
    const token = generarJWT(usuario);
    
    // Responder con los datos del usuario y el token
    return successResponse(res, 200, 'Inicio de sesión exitoso', {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en login de usuario:', error);
    return errorResponse(res, 500, 'Error al iniciar sesión');
  }
};

/**
 * Obtiene el perfil del usuario actualmente autenticado
 * @param {Object} req - Objeto de solicitud Express (con usuario añadido por middleware auth)
 * @param {Object} res - Objeto de respuesta Express
 */
const obtenerPerfil = async (req, res) => {
  try {
    // El middleware auth ya añadió req.usuario con el ID del usuario autenticado
    const usuarioId = req.usuario.id;
    
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['password'] } // Excluir la contraseña de la respuesta
    });
    
    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado');
    }
    
    return successResponse(res, 200, 'Perfil obtenido correctamente', { 
      usuario 
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return errorResponse(res, 500, 'Error al obtener el perfil del usuario');
  }
};

module.exports = {
  registro,
  login,
  obtenerPerfil
};
