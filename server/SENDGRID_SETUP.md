# 📧 Configuración SendGrid - Envío de Correos Electrónicos

Este documento explica cómo configurar SendGrid para enviar notificaciones automáticas cuando se agendan nuevas citas en SeléDental.

## 🚀 ¿Por qué SendGrid?

SendGrid es uno de los proveedores de correo más confiables del mundo, usado por empresas como Spotify, Uber y Pinterest. Sus ventajas:

- ✅ **99%+ de deliverability** (los correos llegan a la bandeja de entrada)
- ✅ **API fácil de usar** sin configuración SMTP compleja
- ✅ **Plan gratuito** de 100 correos/día (perfecto para pruebas)
- ✅ **Analytics detallados** (aperturas, clics, rebotes)
- ✅ **Templates profesionales** y personalización avanzada
- ✅ **Escalable** para millones de correos

## 📋 Paso a Paso: Configuración Completa

### Paso 1: Crear Cuenta en SendGrid

1. Ve a [sendgrid.com](https://sendgrid.com) y crea una cuenta gratuita
2. Verifica tu email de registro
3. Completa el proceso de onboarding

### Paso 2: Crear API Key

1. En el dashboard de SendGrid, ve a **Settings** → **API Keys**
2. Haz clic en **Create API Key**
3. Nombre: `SeléDental API Key`
4. Permisos: **Full Access** (o **Mail Send** para mayor seguridad)
5. Copia la API Key (¡solo se muestra una vez!)

### Paso 3: Configurar Domain Authentication (Recomendado)

Para mayor credibilidad y evitar spam:

1. Ve a **Settings** → **Sender Authentication**
2. Haz clic en **Authenticate Your Domain**
3. Sigue las instrucciones para agregar registros DNS
4. Una vez verificado, podrás enviar desde `noreply@tudominio.com`

### Paso 4: Configurar Variables de Entorno

Edita tu archivo `.env`:

```bash
# Variables de entorno para el servidor
PORT=5000

# Configuración de la base de datos
DB_HOST=localhost
DB_NAME=seledental
DB_USER=admin
DB_PASSWORD=admin
DB_PORT=5432

# JWT (JSON Web Token)
JWT_SECRET=sele_dental_secret_key
JWT_EXPIRES_IN=24h

# Administrador inicial
ADMIN_NOMBRE=Administrador
ADMIN_APELLIDO=Sistema
ADMIN_EMAIL=admin@seledental.com
ADMIN_PASSWORD=admin123

# 📧 Configuración SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@seledental.com
FROM_NAME=SeléDental - Clínica Odontológica
CLIENT_URL=http://localhost:5173
```

### Paso 5: Verificar Configuración

Reinicia tu servidor y agenda una cita de prueba. Deberías ver en la consola:

```bash
✅ Correo enviado exitosamente con SendGrid: {
  messageId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  statusCode: 202,
  destinatario: 'cliente@email.com',
  citaId: 123,
  timestamp: '2025-08-11T...'
}
```

## 🧪 Modo de Prueba vs Producción

### Desarrollo/Pruebas (Sin API Key)
- Si `SENDGRID_API_KEY` no está configurado
- Los correos NO se envían realmente
- Solo aparece un mensaje de advertencia en consola

### Producción (Con API Key)
- Los correos se envían realmente a los destinatarios
- Se registran estadísticas en el dashboard de SendGrid
- Se puede hacer seguimiento de aperturas y clics

## 📊 Características Implementadas

### ✅ Correo de Nueva Cita
Se envía automáticamente cuando un cliente agenda una cita:

- **Destinatario**: Email del cliente
- **Asunto**: "✅ Confirmación de Cita #123 - 15 de agosto de 2025, 14:30"
- **Contenido**: 
  - Template HTML profesional y responsivo
  - Todos los detalles de la cita
  - Link para iniciar sesión
  - Instrucciones importantes
- **Categorías**: `nueva-cita`, `confirmacion` (para organización)
- **Tracking**: Incluye ID de cita y cliente para seguimiento

### 🎨 Template HTML Responsivo
- Diseño profesional con colores corporativos
- Compatible con todos los clientes de correo
- Iconos y estructura clara
- Call-to-action destacado

### 📈 Métricas y Tracking
SendGrid automáticamente rastrea:
- **Delivery**: Si el correo fue entregado
- **Opens**: Si el cliente abrió el correo
- **Clicks**: Si hizo clic en el botón de login
- **Bounces**: Si el email rebotó
- **Spam Reports**: Si fue marcado como spam

## 🔧 Personalización Avanzada

### Cambiar el Template
Edita la función `generarTemplateNuevaCita` en `src/services/emailService.js`:

```javascript
// Cambiar colores
.logo { color: #tu-color; }

// Agregar tu logo
<img src="https://tudominio.com/logo.png" alt="Logo" style="max-width: 200px;">

// Personalizar contenido
<p>Mensaje personalizado de tu clínica...</p>
```

### Agregar Más Tipos de Correo

```javascript
// Ejemplo: Recordatorio de cita
const enviarRecordatorioCita = async (cita, cliente) => {
  const msg = {
    to: cliente.email,
    from: { name: 'SeléDental', email: process.env.FROM_EMAIL },
    subject: `🔔 Recordatorio: Su cita es mañana`,
    html: generarTemplateRecordatorio(cita, cliente),
    categories: ['recordatorio', 'cita'],
    customArgs: { citaId: cita.id.toString(), tipo: 'recordatorio' }
  };
  
  return await sgMail.send(msg);
};
```

## 🔒 Seguridad y Mejores Prácticas

### ✅ Protección de API Key
- Nunca hardcodees la API Key en el código
- Usa variables de entorno siempre
- Rota la API Key cada 6 meses
- Usa permisos mínimos necesarios

### ✅ Sender Reputation
- Autentica tu dominio
- Usa un dominio dedicado para correos transaccionales
- Mantén listas limpias (sin bounces)
- No envíes a listas compradas

### ✅ Compliance
- Incluye información de contacto
- Permite fácil unsubscribe
- Respeta regulaciones locales (GDPR, etc.)

## 📊 Monitoreo y Analytics

### En SendGrid Dashboard:
1. **Statistics** → **Overview**: Métricas generales
2. **Activity**: Log detallado de cada correo
3. **Suppressions**: Emails que rebotaron o se dieron de baja

### En tu aplicación:
```bash
# Logs de éxito
✅ Correo enviado exitosamente con SendGrid: { ... }

# Logs de error
❌ Error al enviar correo con SendGrid: { 
  error: "Unauthorized", 
  code: 401,
  response: "API key invalid"
}
```

## 💰 Precios y Límites

### Plan Gratuito:
- ✅ 100 correos/día de por vida
- ✅ Todas las funcionalidades básicas
- ✅ Analytics completos

### Planes Pagos (si necesitas más):
- **Essentials**: $14.95/mes (40,000 correos)
- **Pro**: $89.95/mes (100,000 correos)
- **Premier**: Custom pricing

## 🚨 Troubleshooting Común

### Error: "API key invalid"
- ✅ Verifica que `SENDGRID_API_KEY` esté correcto
- ✅ Asegúrate de no tener espacios extra
- ✅ Crea una nueva API Key si es necesario

### Error: "The from address does not match a verified Sender Identity"
- ✅ Autentica tu dominio en SendGrid
- ✅ O usa el email verificado en tu cuenta

### Los correos van a spam:
- ✅ Autentica tu dominio
- ✅ Evita palabras spam en el asunto
- ✅ Incluye versión de texto plano

### No llegan los correos:
- ✅ Revisa la pestaña "Activity" en SendGrid
- ✅ Verifica que el email del cliente sea válido
- ✅ Revisa la carpeta de spam del destinatario

## 🎯 Próximos Pasos Recomendados

1. **📅 Recordatorios automáticos**: Correo 24h antes de la cita
2. **👨‍⚕️ Asignación de odontólogo**: Notificar cuando se asigne
3. **🔄 Cambios de cita**: Reagendamiento y cancelaciones
4. **📊 Dashboard de métricas**: Panel de estadísticas de correos
5. **📧 Templates dinámicos**: Usar Dynamic Templates de SendGrid

---

¡Con esta configuración tendrás un sistema de correos profesional y confiable! 🚀
