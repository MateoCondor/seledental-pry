/**
 * Script para crear el primer usuario administrador
 * Este script se ejecuta automáticamente al iniciar la aplicación
 * para asegurar que exista al menos un usuario administrador en el sistema
 */

const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * Crea un usuario administrador predeterminado si no existe ninguno
 */
const crearAdminInicial = async () => {
  try {
    // Verificar si ya existe algún usuario con rol de administrador
    const adminExistente = await Usuario.findOne({
      where: { rol: 'administrador' }
    });

    // Si ya existe un administrador, terminar la función
    if (adminExistente) {
      console.log('✅ Usuario administrador ya existe en el sistema');
      return;
    }

    // Datos del administrador por defecto
    // En un entorno de producción, estos datos deberían venir de variables de entorno
    const adminData = {
      nombre: process.env.ADMIN_NOMBRE || 'Admin',
      apellido: process.env.ADMIN_APELLIDO || 'System',
      email: process.env.ADMIN_EMAIL || 'admin@seledental.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      rol: 'administrador',
      activo: true
    };

    // Crear el usuario administrador
    await Usuario.create(adminData);

    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`📧 Email: ${adminData.email}`);
    console.log('🔑 Contraseña: (definida en variables de entorno o valor por defecto)');

  } catch (error) {
    console.error('❌ Error al crear el administrador inicial:', error);
  }
};

module.exports = crearAdminInicial;
