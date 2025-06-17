/**
 * Archivo principal de rutas
 * Este archivo agrupa y configura todas las rutas de la API
 */

const express = require('express');
const router = express.Router();

// Importar rutas específicas
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const odontologoRoutes = require('./odontologoRoutes');


// Configurar rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/odontologo', odontologoRoutes);

// Ruta base para verificar que la API está funcionando
router.get('/', (req, res) => {
  res.json({
    mensaje: 'API de SeléDental funcionando correctamente',
    version: '1.0.0'
  });
});

module.exports = router;
