/**
 * Archivo principal del servidor
 * Configura y arranca el servidor Express con todas sus funcionalidades
 */

const express = require('express');
const cors = require('cors');
const { sequelize, testDbConnection } = require('./config/database');
const routes = require('./routes');
const crearAdminInicial = require('./utils/adminInicial');

// Cargar variables de entorno
require('dotenv').config();

// Crear la aplicación Express
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors());

// Configurar rutas de la API
app.use('/api', routes);

// Puerto donde se ejecutará el servidor
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
const startServer = async () => {
  try {
    // Probar la conexión a la base de datos
    await testDbConnection();
      // Sincronizar los modelos con la base de datos
    // NOTA: En producción, se recomienda no usar force: true
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos');
    
    // Crear usuario administrador inicial si no existe
    await crearAdminInicial();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`📚 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
