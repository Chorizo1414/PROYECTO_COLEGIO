const express = require('express');
const router = express.Router();
// Asegúrate que tu controlador se importe así:
const { getAllGrades, getSectionsByGrade } = require('../controllers/gradeController');

// Obtener todos los grados
router.get('/', getAllGrades);

// Obtener las secciones de un grado
router.get('/:gradeId/sections', getSectionsByGrade); 

module.exports = router;