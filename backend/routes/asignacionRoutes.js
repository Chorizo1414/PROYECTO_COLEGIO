const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    getAsignaciones, 
    createAsignacion, 
    deleteAsignacion,
    getCursosByGrado,
    updateAsignacion // <-- Importar
} = require('../controllers/asignacionController');

router.get('/', authMiddleware, getAsignaciones);
router.post('/', authMiddleware, createAsignacion);
router.put('/:id', authMiddleware, updateAsignacion); // <-- AÑADIR RUTA PUT
router.delete('/:id', authMiddleware, deleteAsignacion);
router.get('/cursos/:gradeId', authMiddleware, getCursosByGrado);

module.exports = router;