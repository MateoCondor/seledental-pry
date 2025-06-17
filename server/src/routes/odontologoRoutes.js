/**
 * Rutas para odontólogos
 * Este archivo define las rutas específicas para odontólogos
 */

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const checkRol = require('../middlewares/checkRol');

// Middleware de autenticación básica para todas las rutas
router.use(auth);

// Obtener perfil propio
router.get('/perfil', checkRol(['odontologo']), usuarioController.obtenerUsuarioPorId);

// Actualizar perfil propio (solo datos básicos)
router.put('/perfil', checkRol(['odontologo']), usuarioController.actualizarUsuario);

// Aquí se agregarán las rutas para citas cuando se implemente esa funcionalidad
// router.get('/citas', checkRol(['odontologo']), citasController.obtenerCitasOdontologo);

module.exports = router;