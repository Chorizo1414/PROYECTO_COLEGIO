const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createStudent, getAllStudents } = require('../controllers/studentController');

// POST /api/students -> Crear un estudiante
router.post('/', authMiddleware, createStudent);

// GET /api/students -> Obtener todos los estudiantes
router.get('/', authMiddleware, getAllStudents);

module.exports = router;