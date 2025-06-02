/**
 * Rutas de autenticación
 * Este archivo define las rutas para el registro, login y gestión del perfil de usuario
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Ruta para registrar un nuevo usuario
router.post('/registro', authController.registro);

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para obtener el perfil del usuario autenticado
// Requiere estar autenticado (middleware auth)
router.get('/perfil', auth, authController.obtenerPerfil);

module.exports = router;
