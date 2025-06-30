/**
 * Modelo de Cita
 * Este modelo define la estructura de las citas en la base de datos
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  odontologoId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permitir null inicialmente, se asignará después
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipoConsulta: {
    type: DataTypes.ENUM('general', 'control', 'urgencia'),
    allowNull: false
  },
  categoria: {
    type: DataTypes.ENUM(
      // Para consulta general
      'odontologia_general',
      'diagnostico_especialidad',
      // Para consulta de control
      'ortodoncia',
      'endodoncia',
      'cirugia_oral',
      'protesis',
      'periodoncia',
      // Para consulta de urgencia
      'cirugia_oral_urgencia',
      'endodoncia_urgencia',
      'rehabilitacion',
      'trauma_dental'
    ),
    allowNull: false
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duracion: {
    type: DataTypes.INTEGER, // Duración en minutos
    defaultValue: 60,
    allowNull: false
  },
  detalles: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Síntomas o detalles adicionales proporcionados por el cliente'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada', 'no_asistio'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  motivoCancelacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  motivoReagendamiento: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo del reagendamiento'
  },
  fechaAnterior: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha anterior antes del reagendamiento'
  },
  fechaReagendamiento: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se realizó el reagendamiento'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones de la recepcionista al asignar odontólogo'
  },
  fechaAsignacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se asignó el odontólogo'
  },
  notasOdontologo: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas del odontólogo después de la consulta'
  }
}, {
  tableName: 'citas',
  timestamps: true,
  indexes: [
    {
      fields: ['clienteId']
    },
    {
      fields: ['odontologoId']
    },
    {
      fields: ['fechaHora']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = Cita;