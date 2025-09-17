const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTeacher } = require('../controllers/teacherController');

// POST /api/teachers -> Crear un nuevo docente (ruta protegida)
router.post('/', authMiddleware, createTeacher);

// Aquí podrías agregar más rutas (GET, PUT, etc.) en el futuro

module.exports = router;