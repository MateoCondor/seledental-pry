/**
 * Rutas para la gestión de usuarios
 * Este archivo define las rutas para operaciones CRUD de usuarios por parte de administradores
 */

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const checkRol = require('../middlewares/checkRol');

// Middleware de autenticación básica para todas las rutas
router.use(auth);

// Obtener todos los usuarios (administradores ven todos, recepcionistas solo clientes)
router.get('/', checkRol(['administrador', 'recepcionista']), usuarioController.obtenerUsuarios);

// Obtener un usuario específico por ID
router.get('/:id', usuarioController.obtenerUsuarioPorId);

// Crear un nuevo usuario (administradores y recepcionistas)
router.post('/', checkRol(['administrador', 'recepcionista']), usuarioController.crearUsuario);

// Actualizar un usuario
router.put('/:id', usuarioController.actualizarUsuario);

// Eliminar un usuario (desactivación lógica) - solo administradores
router.delete('/:id', checkRol(['administrador', 'recepcionista']), usuarioController.eliminarUsuario);

module.exports = router;
