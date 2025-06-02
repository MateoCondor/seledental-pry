/**
 * Configuración de la conexión a la base de datos con Sequelize
 * Este archivo establece la conexión con PostgreSQL utilizando las variables de entorno
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Crear una instancia de Sequelize con los parámetros de conexión
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nombre de la base de datos
  process.env.DB_USER,     // Usuario de la base de datos
  process.env.DB_PASSWORD, // Contraseña de la base de datos
  {
    host: process.env.DB_HOST,     // Host donde se ejecuta la base de datos
    port: process.env.DB_PORT,     // Puerto de la base de datos
    dialect: 'postgres',           // Tipo de base de datos (PostgreSQL)
    logging: false,                // Deshabilitar logs de consultas SQL
    pool: {
      max: 5,                     // Máximo de conexiones en el pool
      min: 0,                     // Mínimo de conexiones en el pool
      acquire: 30000,             // Tiempo máximo para adquirir una conexión (ms)
      idle: 10000                 // Tiempo máximo que una conexión puede estar inactiva (ms)
    }
  }
);

// Función para probar la conexión a la base de datos
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
};

module.exports = {
  sequelize,
  testDbConnection
};
