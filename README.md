# SeléDental PRY 🦷

Sistema de gestión para clínica dental desarrollado con React y Node.js.

## 📋 Descripción

SeléDental es una aplicación web completa para la gestión de una clínica dental que incluye:

- **Sistema de autenticación** con roles (Admin, Odontólogo, Recepcionista, Cliente)
- **Gestión de citas** médicas
- **Gestión de usuarios** y perfiles
- **Comunicación en tiempo real** con WebSockets
- **Interfaz moderna** con React y Tailwind CSS

## 🛠️ Tecnologías Utilizadas

### Frontend (Cliente)
- **React 19** - Framework de interfaz de usuario
- **Vite** - Herramienta de desarrollo y construcción
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router DOM** - Enrutamiento del lado del cliente
- **Axios** - Cliente HTTP para consumir APIs
- **Socket.IO Client** - Comunicación en tiempo real
- **React Hook Form** - Manejo de formularios
- **React Hot Toast** - Notificaciones

### Backend (Servidor)
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para PostgreSQL
- **Socket.IO** - Comunicación en tiempo real
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hash de contraseñas

## 📋 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (incluido con Node.js) o **yarn**
- **PostgreSQL** (versión 12 o superior) - [Descargar aquí](https://www.postgresql.org/download/)
- **Git** - [Descargar aquí](https://git-scm.com/)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MateoCondor/seledental-pry.git
cd seledental-pry
```

### 2. Configuración de la Base de Datos

#### Instalar PostgreSQL
1. Descarga e instala PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/)
2. Durante la instalación, anota la contraseña del usuario `postgres`
3. Abre pgAdmin o utiliza la línea de comandos de PostgreSQL

#### Crear la Base de Datos
```sql
-- Conectarse a PostgreSQL y ejecutar:
CREATE DATABASE seledental;
CREATE USER seledental_user WITH PASSWORD 'tu_contraseña_aquí';
GRANT ALL PRIVILEGES ON DATABASE seledental TO seledental_user;
```

### 3. Configuración del Servidor (Backend)

#### Navegar al directorio del servidor
```bash
cd server
```

#### Instalar dependencias
```bash
npm install
```

#### Configurar variables de entorno
Crea un archivo `.env` en la carpeta `server` con el siguiente contenido (ejemplo en .env.example):

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seledental
DB_USER=seledental_user
DB_PASSWORD=tu_contraseña_aquí

# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aquí
JWT_EXPIRES_IN=24h

# URL del cliente (para CORS)
CLIENT_URL=http://localhost:5173
```

### 4. Configuración del Cliente (Frontend)

#### Abrir una nueva terminal y navegar al directorio del cliente
```bash
cd client
```

#### Instalar dependencias
```bash
npm install
```

#### Configurar variables de entorno (OPCIONAL)
Crea un archivo `.env` en la carpeta `client` si necesitas configurar la URL del API:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🏃‍♂️ Ejecutar el Proyecto

### Opción 1: Ejecutar Servidor y Cliente por Separado

#### Terminal 1 - Servidor (Backend)
```bash
cd server
npm run dev
```
El servidor se ejecutará en: `http://localhost:5000`

#### Terminal 2 - Cliente (Frontend)
```bash
cd client
npm run dev
```
El cliente se ejecutará en: `http://localhost:5173`

## 👥 Usuarios Predeterminados

El sistema crea automáticamente un usuario administrador al iniciar:

```
Email: admin@seledental.com
Contraseña: admin123
Rol: Administrador
```

## 📁 Estructura del Proyecto

```
seledental-pry/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── contexts/      # Contextos de React
│   │   ├── hooks/         # Hooks personalizados
│   │   └── services/      # Servicios API
│   ├── public/            # Archivos estáticos
│   └── package.json
├── server/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── models/        # Modelos de Sequelize
│   │   ├── routes/        # Definición de rutas
│   │   ├── middlewares/   # Middlewares personalizados
│   │   ├── services/      # Servicios (email, etc.)
│   │   └── config/        # Configuraciones
│   └── package.json
└── README.md
```

## 🔧 Scripts Disponibles

### Cliente (Frontend)
```bash
npm run dev      # Modo desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa de la construcción
npm run lint     # Ejecutar linter
```

### Servidor (Backend)
```bash
npm start        # Iniciar en modo producción
npm run dev      # Iniciar en modo desarrollo (con nodemon)
```

## 🌐 Puertos Utilizados

- **Cliente**: `http://localhost:5173`
- **Servidor**: `http://localhost:5000`
- **PostgreSQL**: `localhost:5432`

## 🔍 Solución de Problemas

### Error de conexión a la base de datos
1. Verifica que PostgreSQL esté ejecutándose
2. Confirma las credenciales en el archivo `.env`
3. Asegúrate de que la base de datos `seledental` exista

### Error de puertos ocupados
```bash
# Verificar qué procesos usan los puertos
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Terminar proceso si es necesario
taskkill /PID <PID_NUMBER> /F
```

### Problemas con dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas Adicionales

- El proyecto utiliza **PostgreSQL** como base de datos principal
- Las contraseñas se encriptan usando **bcryptjs**
- El sistema utiliza **JWT** para la autenticación
- La comunicación en tiempo real se maneja con **Socket.IO**
- El frontend está optimizado con **Tailwind CSS** para una interfaz moderna

## 📄 Autoria

Este proyecto esta desarrollado y elaborado por Mateo Condor - D3mian.

