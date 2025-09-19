const express = require('express');
const router = express.Router();

// --- CORRECCIÓN CLAVE AQUÍ ---
// Usamos desestructuración { loginUser } para importar la función específica.
const { loginUser } = require('../controllers/authController');

// La ruta ahora recibe una función válida y el servidor no se detendrá.
router.post('/login', loginUser);

module.exports = router;