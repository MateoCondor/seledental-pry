/**
 * Archivo para inicializar y relacionar todos los modelos de la aplicación
 * Este archivo importa todos los modelos y establece sus relaciones
 */

const Usuario = require('./Usuario');
const Cita = require('./Cita');

// Definir relaciones entre modelos
// Un usuario (cliente) puede tener muchas citas
Usuario.hasMany(Cita, {
  foreignKey: 'clienteId',
  as: 'citasComoCliente'
});

// Un usuario (odontólogo) puede tener muchas citas asignadas
Usuario.hasMany(Cita, {
  foreignKey: 'odontologoId',
  as: 'citasComoOdontologo'
});

// Una cita pertenece a un cliente
Cita.belongsTo(Usuario, {
  foreignKey: 'clienteId',
  as: 'cliente'
});

// Una cita pertenece a un odontólogo
Cita.belongsTo(Usuario, {
  foreignKey: 'odontologoId',
  as: 'odontologo'
});

// Exportar todos los modelos
module.exports = {
  Usuario,
  Cita
};