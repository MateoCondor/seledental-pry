/**
 * Rutas para la gestión de citas
 * Este archivo define las rutas para operaciones de citas
 */

const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const auth = require('../middlewares/auth');
const checkRol = require('../middlewares/checkRol');

// Middleware de autenticación básica para todas las rutas
router.use(auth);

// Obtener categorías de consulta
router.get('/categorias', citaController.obtenerCategorias);

// Obtener horarios disponibles para una fecha
router.get('/horarios-disponibles', citaController.obtenerHorariosDisponibles);

// Rutas para clientes
router.post('/', checkRol(['cliente']), citaController.crearCita);
router.get('/mis-citas', checkRol(['cliente']), citaController.obtenerCitasCliente);
router.put('/:id/cancelar', checkRol(['cliente', 'recepcionista', 'administrador']), citaController.cancelarCita);
router.put('/:id/reagendar', checkRol(['cliente', 'recepcionista', 'administrador']), citaController.reagendarCita);

// Rutas para recepcionista
router.get('/pendientes', checkRol(['recepcionista', 'administrador']), citaController.obtenerCitasPendientes);
router.get('/odontologos', checkRol(['recepcionista', 'administrador']), citaController.obtenerOdontologos);
router.put('/:id/asignar-odontologo', checkRol(['recepcionista', 'administrador']), citaController.asignarOdontologo);

// Aquí se agregarán más rutas para odontólogos y administradores
// router.get('/odontologo', checkRol(['odontologo']), citaController.obtenerCitasOdontologo);
// router.put('/:id/confirmar', checkRol(['recepcionista', 'administrador']), citaController.confirmarCita);

module.exports = router;