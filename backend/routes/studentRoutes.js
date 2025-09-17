const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createStudent, 
  getAllStudents, 
  linkParentToStudent,
  getStudentsWithDetails,  
  updateFinancialStatus       
} = require('../controllers/studentController');

// POST /api/students -> Crear un estudiante
router.post('/', authMiddleware, createStudent);

// GET /api/students -> Obtener todos los estudiantes
router.get('/', authMiddleware, getAllStudents);

// POST /api/students/link-parent -> Vincular un padre a un estudiante
router.post('/link-parent', authMiddleware, linkParentToStudent);

// GET /api/students/details -> Obtener lista de alumnos para secretaría (NUEVA)
router.get('/details', authMiddleware, getStudentsWithDetails);

// POST /api/students/financial-status -> Marcar como solvente (NUEVA)
router.post('/financial-status', authMiddleware, updateFinancialStatus);

module.exports = router;