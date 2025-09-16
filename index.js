// Importar las dependencias
const express = require('express');
const cors = require('cors');

// Crear la aplicación de Express
const app = express();

// Configurar middlewares
app.use(cors()); // Permite peticiones de otros orígenes (tu frontend)
app.use(express.json()); // Permite al servidor entender JSON

// Definir rutas
app.use('/api/auth', require('./routes/authRoutes'));

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
  res.status(200).send('¡El backend está conectado y funcionando!');
});

// Definir el puerto
const PORT = process.env.PORT || 4000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});