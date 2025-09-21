// en backend/controllers/notificationController.js
const pool = require('../config/db');
const { sendMessage } = require('../services/whatsappService');

const sendPaymentReminder = async (req, res) => {
  const { cui_estudiante } = req.body;
  try {
    // 1. Buscar al padre/encargado principal y su teléfono
    const parentQuery = `
      SELECT 
        p.nombre_completo AS nombre_padre,
        p.telefono,
        e.nombres || ' ' || e.apellidos AS nombre_estudiante
      FROM padres p
      JOIN alumno_responsable ar ON p.cui_padre = ar.cui_padre
      JOIN estudiantes e ON ar.cui_estudiante = e.cui_estudiante
      WHERE ar.cui_estudiante = $1 AND ar.principal = TRUE;
    `;
    const result = await pool.query(parentQuery, [cui_estudiante]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'No se encontró un encargado principal para este alumno.' });
    }

    const { nombre_padre, telefono, nombre_estudiante } = result.rows[0];
    // Importante: Asegúrate de que el número de teléfono esté en formato internacional (ej: 502xxxxxxxx)
    const formattedPhone = telefono.replace(/[^0-9]/g, ''); 

    // 2. Crear el mensaje
    const message = `Estimado/a ${nombre_padre}, le saludamos del Colegio "El Jardín". Le recordamos amablemente que el pago de la colegiatura para el/la estudiante ${nombre_estudiante} se encuentra pendiente. ¡Gracias!`;

    // 3. Enviar el mensaje usando nuestro servicio
    const whatsappResult = await sendMessage(formattedPhone, message);
    if (!whatsappResult.success) {
      throw new Error('El proveedor de WhatsApp rechazó el envío.');
    }

    // 4. (Opcional) Guardar un registro del envío en la BD
    // await pool.query('INSERT INTO whatsapp_envios ...');

    res.status(200).json({ msg: `Mensaje de recordatorio enviado a ${nombre_padre}.` });

  } catch (error) {
    console.error("Error en el proceso de envío de recordatorio:", error.message);
    res.status(500).json({ msg: 'Error interno al intentar enviar el mensaje.' });
  }
};

module.exports = { sendPaymentReminder };