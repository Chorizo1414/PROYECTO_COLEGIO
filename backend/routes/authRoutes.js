// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// @ruta    POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @acceso  Público
router.post('/login', login);

module.exports = router;