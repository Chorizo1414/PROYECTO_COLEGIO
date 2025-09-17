const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAllGrades } = require('../controllers/gradeController');

// GET /api/grades -> Obtener todos los grados (ruta protegida)
router.get('/', authMiddleware, getAllGrades);

module.exports = router;