/**
 * Middleware para validar los roles de usuario
 * Este middleware verifica que el usuario tenga el rol necesario para acceder a una ruta
 */

const { errorResponse } = require('../utils/responses');

/**
 * Middleware para verificar roles de usuario
 * @param {String[]} roles - Array con los roles autorizados para acceder a la ruta
 * @returns {Function} Middleware que verifica si el rol del usuario está autorizado
 */
const checkRol = (roles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario existe en la solicitud (middleware auth)
      if (!req.usuario) {
        return errorResponse(res, 401, 'Acceso no autorizado. Usuario no autenticado');
      }
      
      // Obtener el rol del usuario
      const { rol } = req.usuario;
      
      // Verificar si el rol del usuario está en la lista de roles permitidos
      if (!roles.includes(rol)) {
        return errorResponse(
          res, 
          403, 
          'Acceso denegado. No tiene permisos suficientes',
          { rol_actual: rol, roles_permitidos: roles }
        );
      }
      
      // Si el usuario tiene el rol adecuado, continuar
      next();
    } catch (error) {
      console.error('Error en middleware checkRol:', error);
      return errorResponse(res, 500, 'Error al verificar los permisos');
    }
  };
};

module.exports = checkRol;
