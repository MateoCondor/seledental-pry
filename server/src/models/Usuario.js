/**
 * Modelo de Usuario
 * Este modelo define la estructura de los usuarios en la base de datos
 * Incluye los campos necesarios para la autenticación y gestión de roles
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// Definición del modelo Usuario
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 100] // La contraseña debe tener entre 6 y 100 caracteres
    }
  },
  rol: {
    type: DataTypes.ENUM('administrador', 'recepcionista', 'cliente', 'odontologo'),
    defaultValue: 'cliente',
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Nuevos campos para clientes
  cedula: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      len: [8, 20] // Longitud de cédula entre 8 y 20 caracteres
    }
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [8, 15] // Longitud de celular entre 8 y 15 caracteres
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  perfilCompleto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Para saber si el cliente completó sus datos adicionales
  }
}, {
  // Opciones del modelo
  tableName: 'usuarios',
  timestamps: true, // Habilita createdAt y updatedAt
  // Hooks (funciones que se ejecutan antes o después de ciertas acciones)
  hooks: {
    // Hash de la contraseña antes de guardar el usuario
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        // Generar un salt con 10 rondas
        const salt = await bcrypt.genSalt(10);
        // Aplicar el hash a la contraseña
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    // Hash de la contraseña antes de actualizar, si esta ha cambiado
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    }
  }
});

// Método para verificar si una contraseña coincide con el hash almacenado
Usuario.prototype.verificarPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;