/**
 * Archivo para inicializar y relacionar todos los modelos de la aplicación
 * Este archivo importa todos los modelos y establece sus relaciones
 */

const Usuario = require('./Usuario');

// Aquí se pueden agregar más modelos en el futuro
// const OtroModelo = require('./OtroModelo');

// Definir relaciones entre modelos
// Ejemplo: 
// Usuario.hasMany(OtroModelo);
// OtroModelo.belongsTo(Usuario);

// Exportar todos los modelos
module.exports = {
  Usuario
};
