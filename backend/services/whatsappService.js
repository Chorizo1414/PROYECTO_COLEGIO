// en backend/services/whatsappService.js
const axios = require('axios');

const sendMessage = async (to, message) => {
  try {
    const data = {
      messaging_product: "whatsapp",
      to: to, // Número de destino en formato internacional (ej: 50212345678)
      type: "text",
      text: {
        body: message
      }
    };

    const config = {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    // La URL de la API de Meta
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    await axios.post(url, data, config);
    console.log(`Mensaje de WhatsApp enviado a ${to}`);
    return { success: true };

  } catch (error) {
    console.error("Error al enviar mensaje de WhatsApp:", error.response ? error.response.data : error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendMessage };