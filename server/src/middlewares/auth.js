/**
 * Middleware para verificar la autenticación del usuario
 * Este middleware valida que un token JWT sea válido antes de permitir el acceso a rutas protegidas
 */

const { verificarJWT } = require('../utils/jwt');
const { errorResponse } = require('../utils/responses');
const Usuario = require('../models/Usuario');

/**
 * Middleware para verificar que el usuario esté autenticado
 * Comprueba que el token sea válido y que el usuario exista en la base de datos
 */
const auth = async (req, res, next) => {
  try {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers.authorization;
    
    // Verificar que existe el encabezado y que comienza con 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Acceso no autorizado. Token no proporcionado');
    }
    
    // Extraer el token (eliminar 'Bearer ' del inicio)
    const token = authHeader.split(' ')[1];
    
    // Verificar la validez del token
    const decoded = verificarJWT(token);
    if (!decoded) {
      return errorResponse(res, 401, 'Acceso no autorizado. Token inválido o expirado');
    }
    
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return errorResponse(res, 401, 'Acceso no autorizado. Usuario no encontrado');
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return errorResponse(res, 403, 'Acceso denegado. Usuario desactivado');
    }
    
    // Añadir los datos del usuario al objeto request para uso posterior
    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      perfilCompleto: usuario.perfilCompleto // Agregar este campo
    };
    
    // Continuar con la siguiente función en la cadena de middleware
    next();
  } catch (error) {
    console.error('Error en middleware auth:', error);
    return errorResponse(res, 500, 'Error en la autenticación');
  }
};

module.exports = auth;