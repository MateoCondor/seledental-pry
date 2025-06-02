/**
 * Utilidades para enviar respuestas HTTP estandarizadas
 * Estas funciones permiten mantener un formato consistente en todas las respuestas de la API
 */

/**
 * Envía una respuesta de éxito
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Number} statusCode - Código de estado HTTP (default: 200)
 * @param {String} mensaje - Mensaje descriptivo del resultado
 * @param {Object|Array} datos - Datos a incluir en la respuesta
 */
const successResponse = (res, statusCode = 200, mensaje = 'Operación exitosa', datos = null) => {
  return res.status(statusCode).json({
    success: true,
    mensaje,
    datos
  });
};

/**
 * Envía una respuesta de error
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Number} statusCode - Código de estado HTTP (default: 500)
 * @param {String} mensaje - Mensaje descriptivo del error
 * @param {Object} errores - Detalles adicionales sobre el error
 */
const errorResponse = (res, statusCode = 500, mensaje = 'Error en el servidor', errores = null) => {
  return res.status(statusCode).json({
    success: false,
    mensaje,
    errores
  });
};

module.exports = {
  successResponse,
  errorResponse
};
