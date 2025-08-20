/**
 * Servicio de Correo Electrónico con SendGrid
 * Este servicio maneja el envío de correos electrónicos usando SendGrid
 */

const sgMail = require('@sendgrid/mail');

// Configurar SendGrid con la API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SENDGRID_API_KEY no configurado. Los correos no se enviarán.');
}

/**
 * Formatea la fecha y hora para mostrar en el correo
 * @param {Date} fechaHora - Fecha y hora de la cita
 * @returns {string} - Fecha y hora formateada
 */
const formatearFechaHora = (fechaHora) => {
  const opciones = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota' // Ajusta según tu zona horaria
  };
  
  return new Date(fechaHora).toLocaleDateString('es-ES', opciones);
};

/**
 * Traduce el tipo de consulta a español
 * @param {string} tipoConsulta - Tipo de consulta
 * @returns {string} - Tipo de consulta en español
 */
const traducirTipoConsulta = (tipoConsulta) => {
  const traducciones = {
    'general': 'General',
    'control': 'Control',
    'urgencia': 'Urgencia'
  };
  return traducciones[tipoConsulta] || tipoConsulta;
};

/**
 * Traduce la categoría a español
 * @param {string} categoria - Categoría de la cita
 * @returns {string} - Categoría en español
 */
const traducirCategoria = (categoria) => {
  const traducciones = {
    'odontologia_general': 'Odontología general',
    'diagnostico_especialidad': 'Diagnóstico por especialidad',
    'ortodoncia': 'Ortodoncia',
    'endodoncia': 'Endodoncia',
    'cirugia_oral': 'Cirugía oral',
    'cirugia_oral_urgencia': 'Cirugía oral',
    'endodoncia_urgencia': 'Endodoncia',
    'protesis': 'Prótesis',
    'periodoncia': 'Periodoncia',
    'rehabilitacion': 'Rehabilitación',
    'trauma_dental': 'Trauma dental'
  };
  return traducciones[categoria] || categoria;
};

/**
 * Genera el template HTML para el correo de nueva cita
 * @param {Object} cita - Datos de la cita
 * @param {Object} cliente - Datos del cliente
 * @returns {string} - HTML del correo
 */
const generarTemplateNuevaCita = (cita, cliente) => {
  const fechaHoraFormateada = formatearFechaHora(cita.fechaHora);
  const tipoConsultaTexto = traducirTipoConsulta(cita.tipoConsulta);
  const categoriaTexto = traducirCategoria(cita.categoria);
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita - SeléDental</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                color: #007bff;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .title {
                color: #28a745;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .cita-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #007bff;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .info-label {
                font-weight: bold;
                color: #495057;
            }
            .info-value {
                color: #007bff;
                font-weight: 500;
            }
            .estado {
                background-color: #fff3cd;
                color: #856404;
                padding: 10px;
                border-radius: 5px;
                text-align: center;
                margin: 20px 0;
                border: 1px solid #ffeaa7;
            }
            .actions {
                background-color: #e9ecef;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 10px 0;
            }
            .btn:hover {
                background-color: #0056b3;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
            .note {
                background-color: #d1ecf1;
                color: #0c5460;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #bee5eb;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🦷 SeléDental</div>
                <div class="title">¡Cita Agendada Exitosamente!</div>
            </div>

            <p>Estimado/a <strong>${cliente.nombre} ${cliente.apellido}</strong>,</p>

            <p>Su cita ha sido agendada exitosamente en nuestro sistema. A continuación encontrará los detalles de su cita:</p>

            <div class="cita-info">
                <h3 style="margin-top: 0; color: #007bff;">📅 Detalles de la Cita</h3>
                
                <div class="info-row">
                    <span class="info-label">📅 Fecha y Hora:</span>
                    <span class="info-value">${fechaHoraFormateada}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">🏥 Tipo de Consulta:</span>
                    <span class="info-value">${tipoConsultaTexto}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">🔬 Especialidad:</span>
                    <span class="info-value">${categoriaTexto}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">⏰ Duración:</span>
                    <span class="info-value">${cita.duracion || 60} minutos</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">📋 ID de Cita:</span>
                    <span class="info-value">#${cita.id}</span>
                </div>
            </div>

            <div class="estado">
                <strong>📋 Estado Actual:</strong> Pendiente de asignación de odontólogo
            </div>

            ${cita.detalles ? `
            <div class="note">
                <strong>📝 Detalles adicionales:</strong><br>
                ${cita.detalles}
            </div>
            ` : ''}

            <div class="actions">
                <h3 style="margin-top: 0; color: #495057;">🎯 Próximos Pasos</h3>
                <p>Para gestionar su cita, ver actualizaciones o realizar cambios, ingrese a su cuenta:</p>
                
                <div style="text-align: center;">
                    <a href="${loginUrl}" class="btn">🔐 Iniciar Sesión en Mi Cuenta</a>
                </div>
                
                <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                    <strong>Desde su cuenta podrá:</strong><br>
                    • Ver el estado actualizado de su cita<br>
                    • Conocer qué odontólogo fue asignado<br>
                    • Reagendar si es necesario<br>
                    • Cancelar la cita si es requerido<br>
                    • Ver todas sus citas programadas
                </p>
            </div>

            <div class="note">
                <strong>⚠️ Importante:</strong><br>
                • Llegue 15 minutos antes de su cita<br>
                • Traiga su documento de identidad<br>
                • Si requiere cancelar, hágalo con al menos 24 horas de anticipación<br>
                • En caso de urgencia, comuníquese con nosotros inmediatamente
            </div>

            <div class="footer">
                <p><strong>SeléDental - Clínica Odontológica</strong></p>
                <p>📧 Email: info@seledental.com | 📞 Teléfono: +57 (1) 234-5678</p>
                <p>📍 Dirección: Calle Principal #123, Bogotá, Colombia</p>
                <hr style="margin: 20px 0;">
                <p style="font-size: 12px;">
                    Este es un correo automático, por favor no responda a esta dirección.<br>
                    Si tiene alguna consulta, ingrese a su cuenta o contáctenos directamente.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Envía un correo de confirmación de nueva cita usando SendGrid
 * @param {Object} cita - Datos de la cita
 * @param {Object} cliente - Datos del cliente
 * @returns {Promise<boolean>} - True si se envió correctamente, false en caso contrario
 */
const enviarCorreoNuevaCita = async (cita, cliente) => {
  try {
    // Verificar que SendGrid esté configurado
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY no configurado. No se enviará email.');
      return false;
    }

    const fechaHoraFormateada = formatearFechaHora(cita.fechaHora);
    const tipoConsultaTexto = traducirTipoConsulta(cita.tipoConsulta);
    const categoriaTexto = traducirCategoria(cita.categoria);

    // Configurar el mensaje de correo
    const msg = {
      to: cliente.email,
      from: {
        name: process.env.FROM_NAME || 'SeléDental - Clínica Odontológica',
        email: process.env.FROM_EMAIL || 'noreply@seledental.com'
      },
      subject: `✅ Confirmación de Cita #${cita.id} - ${fechaHoraFormateada}`,
      html: generarTemplateNuevaCita(cita, cliente),
      text: `
Estimado/a ${cliente.nombre} ${cliente.apellido},

Su cita ha sido agendada exitosamente en SeléDental.

DETALLES DE LA CITA:
- Fecha y Hora: ${fechaHoraFormateada}
- Tipo de Consulta: ${tipoConsultaTexto}
- Especialidad: ${categoriaTexto}
- Duración: ${cita.duracion || 60} minutos
- ID de Cita: #${cita.id}
- Estado: Pendiente de asignación de odontólogo

${cita.detalles ? `Detalles adicionales: ${cita.detalles}` : ''}

Para gestionar su cita, ingrese a: ${process.env.CLIENT_URL || 'http://localhost:5173'}

IMPORTANTE:
- Llegue 15 minutos antes de su cita
- Traiga su documento de identidad
- Para cancelar, hágalo con 24 horas de anticipación

Atentamente,
Equipo SeléDental
      `,
      // Categorías para organización en SendGrid
      categories: ['nueva-cita', 'confirmacion'],
      // Datos personalizados para tracking
      customArgs: {
        citaId: cita.id.toString(),
        clienteId: cliente.id.toString(),
        tipoConsulta: cita.tipoConsulta
      }
    };

    // Enviar el correo
    const result = await sgMail.send(msg);
    
    console.log('✅ Correo enviado exitosamente con SendGrid:', {
      messageId: result[0].headers['x-message-id'],
      statusCode: result[0].statusCode,
      destinatario: cliente.email,
      citaId: cita.id,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    // Manejo específico de errores de SendGrid
    if (error.code === 401) {
      console.error('🔑 ERROR DE AUTORIZACIÓN - SendGrid:', {
        mensaje: 'API Key inválida o sin permisos',
        solucion: 'Verifica que SENDGRID_API_KEY sea correcta y tenga permisos de Mail Send',
        citaId: cita.id,
        destinatario: cliente.email
      });
    } else if (error.code === 403) {
      console.error('📧 ERROR DE SENDER - SendGrid:', {
        mensaje: 'Email FROM no verificado',
        solucion: `Verifica el email ${process.env.FROM_EMAIL} en SendGrid Single Sender`,
        citaId: cita.id,
        destinatario: cliente.email
      });
    } else {
      console.error('❌ Error al enviar correo con SendGrid:', {
        error: error.message,
        code: error.code,
        citaId: cita.id,
        destinatario: cliente.email,
        response: error.response?.body || 'Sin respuesta'
      });
    }
    
    return false;
  }
};

module.exports = {
  enviarCorreoNuevaCita,
  formatearFechaHora,
  traducirTipoConsulta,
  traducirCategoria
};
