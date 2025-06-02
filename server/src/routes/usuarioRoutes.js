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

// Obtener todos los usuarios (solo administradores)
router.get('/', checkRol(['administrador']), usuarioController.obtenerUsuarios);

// Obtener un usuario específico por ID
// Se verifica en el controlador que solo administradores o el propio usuario puedan acceder
router.get('/:id', usuarioController.obtenerUsuarioPorId);

// Crear un nuevo usuario (solo administradores)
router.post('/', checkRol(['administrador']), usuarioController.crearUsuario);

// Actualizar un usuario
// Se verifica en el controlador que solo administradores o el propio usuario puedan actualizar
router.put('/:id', usuarioController.actualizarUsuario);

// Eliminar un usuario (desactivación lógica) - solo administradores
router.delete('/:id', checkRol(['administrador']), usuarioController.eliminarUsuario);

module.exports = router;
