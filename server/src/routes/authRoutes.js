/**
 * Rutas de autenticación
 * Este archivo define las rutas para el registro, login y gestión del perfil de usuario
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Ruta para registro público de clientes
router.post('/registro-cliente', authController.registroCliente);

// Ruta para registrar un nuevo usuario (para administradores)
router.post('/registro', authController.registro);

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para obtener el perfil del usuario autenticado
// Requiere estar autenticado (middleware auth)
router.get('/perfil', auth, authController.obtenerPerfil);

// Ruta para completar el perfil de un cliente
router.put('/completar-perfil', auth, authController.completarPerfil);

module.exports = router;